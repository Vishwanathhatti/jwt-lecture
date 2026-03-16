// src/utils/jwt.js
// All our JWT helper functions lives here.
// Instead of writing jwt.sign() and jwt.verify() in every controller,
// we put them here once and import wherever we need them. Cleaner that way.
//
// Quick refresher on what a JWT looks like:
//
//   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9        <-- Header  (base64)
//   .eyJ1c2VySWQiOiIxMjMiLCJpYXQiOjE2MDAwMDB9  <-- Payload (base64)
//   .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c <-- Signature
//
// The three parts are separated by dots.
// The signature is create using our secret key — anybody who have the secret key
// can verify the token hasnt been tempered with.

import jwt from 'jsonwebtoken';

// generateAccessToken — creates a short lived token (15 minutes)
// This is what we send in the response body after login.
// The client uses this in the Authorization header for every protected API call.
export const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,                          // the data we want to encode (userId, email, etc)
    process.env.ACCESS_TOKEN_SECRET,  // our secret key for signing
    { expiresIn: '15m' }              // token dies after 15 minutes
  );
};

// generateRefreshToken — creates a long lived token (7 days)
// This one goes into a HTTP-only cookie and also gets saved to the database.
// We use a DIFFERENT secret key here than the access token — important!
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET, // different secret from access token
    { expiresIn: '7d' }
  );
};

// verifyAccessToken — checks if the access token is valid and not expired
// Returns the decoded payload if everything is fine.
// If the token is expired or been tampered — it throws an error.
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

// verifyRefreshToken — same thing but for refresh tokens
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};
