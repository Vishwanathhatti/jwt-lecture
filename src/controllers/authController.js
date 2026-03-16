// src/controllers/authController.js
// This is the brain of our auth system.
// All the actual logic for register, login, refresh and logout lives here.
// The routes just call these functions — keeps things organized.

import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

// ── REGISTER ────────────────────────────────────────────────────────────────
// POST /auth/register
// Takes name, email and password — creates a new user in the database.
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Lets check if user with this email already exists before creating anything
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    // User.create() saves the user to MongoDB.
    // The password gets hashed automaticaly by our pre-save hook in User.js —
    // we dont need to hash it manually here, mongoose does it for us.
    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: '✅ Registration successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── LOGIN ────────────────────────────────────────────────────────────────────
// POST /auth/login
// Verifies the credentials and gives back both tokens.
//
// Flow:
//  1. Find the user by email
//  2. Check if password matches the hash in database
//  3. Generate an access token (short lived — 15 min)
//  4. Generate a refresh token (long lived — 7 days)
//  5. Save the refresh token to MongoDB (so we can revoke it later)
//  6. Send refresh token as HTTP-only cookie (javascript cant read this!)
//  7. Send access token in the response body
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find the user — we return the same error for wrong email OR wrong
    // password on purpose. This way attacker cant know which one was wrong.
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // The payload is the data we embed inside the JWT.
    // ⚠️ Remember — payload is base64 encoded NOT encrypted.
    // Anyone can decode it, so dont put passwords or sensitive stuff here!
    const payload = { userId: user._id, email: user.email, name: user.name };

    const accessToken = generateAccessToken(payload);   // dies in 15 min
    const refreshToken = generateRefreshToken(payload); // dies in 7 days

    // Save the refresh token in DB so we can delete it on logout
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    await RefreshToken.create({ token: refreshToken, userId: user._id, expiresAt });

    // Set the refresh token as an HTTP-only cookie.
    // httpOnly: true means javascript in the browser can NOT access this cookie.
    // This protects us from XSS attacks where malicious scripts try to steal tokens.
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,      // change to true in production (needs HTTPS)
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: '✅ Login successful!',
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '15 minutes',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── REFRESH ──────────────────────────────────────────────────────────────────
// POST /auth/refresh
// Uses the refresh token from the cookie to issue a brand new access token.
//
// This is called automatically by the client when the access token expires.
// The user dont even notice this happening — it feels seamless.
export const refresh = async (req, res) => {
  try {
    // Read the refresh token from the cookie
    // (cookie-parser middleware makes this available on req.cookies)
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: '❌ No refresh token found in cookies.',
        hint: 'Please login again.',
      });
    }

    // Step 1 — Verify the JWT signature and check if its expired
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({
        message: '❌ Refresh token is invalid or expired.',
        hint: 'Please login again.',
      });
    }

    // Step 2 — Check if this token still exists in our database
    // If the user already logged out, we deleted it from DB — so it wont be found here
    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      return res.status(401).json({
        message: '❌ This refresh token has been revoked.',
        hint: 'Please login again.',
      });
    }

    // Step 3 — Everything looks good, issue a fresh access token
    const newPayload = { userId: decoded.userId, email: decoded.email, name: decoded.name };
    const newAccessToken = generateAccessToken(newPayload);

    res.status(200).json({
      message: '✅ New access token issued!',
      accessToken: newAccessToken,
      tokenType: 'Bearer',
      expiresIn: '15 minutes',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── LOGOUT ───────────────────────────────────────────────────────────────────
// POST /auth/logout
// Deletes the refresh token from DB and clears the cookie.
//
// One thing students often get confuse about:
// After logout, the ACCESS TOKEN is still technically valid until it expires (15 min).
// This is becuase access tokens are stateless — we dont track them in database.
// Thats the trade off with JWT — you get scalability but lose instant revocation.
// Thats why keeping access tokens short lived (5-15 min) is so important.
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Remove the refresh token from the database — its revoked now
      await RefreshToken.findOneAndDelete({ token });
    }

    // Clear the cookie from the clients browser
    res.clearCookie('refreshToken');

    res.status(200).json({
      message: '✅ Logged out successfully!',
      note: 'Refresh token revoked. Your access token will expire in ~15 minutes.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET CURRENT USER (protected) ─────────────────────────────────────────────
// GET /auth/me
// Returns the profile of the currently logged in user.
// This route is protected — the `protect` middleware runs before this
// and puts the decoded token data in req.user
export const getMe = async (req, res) => {
  try {
    // req.user was set by our protect middleware after verifying the access token
    // .select('-password') means dont return the password field — never expose that!
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: '✅ Here is your profile from a protected route!',
      user,
      tokenPayload: req.user, // showing the decoded payload for learning purposes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
