// src/middleware/auth.js
// This middleware protects our routes.
// Basically before any request reaches the route handler,
// it passes through here first and we check the access token.
//
// If the token is valid — we let the request through.
// If the token is missing or expired — we block it and send a 401 error.
//
// Middleware always have three arguments: req, res, and next.
// Calling next() pass control to the next handler in the chain.
// Not calling next() stops the request right here.

import { verifyAccessToken } from '../utils/jwt.js';

const protect = (req, res, next) => {
  // We expect the token in the Authorization header like this:
  //   Authorization: Bearer eyJhbGci...
  const authHeader = req.headers['authorization'];

  // If there is no header or it doesnt start with "Bearer ", we reject the request
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: '❌ Access denied. No token provided.',
      hint: 'Add this header to your request: Authorization: Bearer <your_access_token>',
    });
  }

  // Split on the space and grab just the token part (index 1)
  // "Bearer eyJhbGci..." → ["Bearer", "eyJhbGci..."]
  const token = authHeader.split(' ')[1];

  try {
    // verifyAccessToken() will throw an error if the token is expired or invalid
    // If it returns without throwing — the token is good and we get the payload
    const decoded = verifyAccessToken(token);

    // We attach the decoded user info to req.user so the next handler can use it
    // For example: req.user.userId or req.user.email
    req.user = decoded;

    // Pass control to the next middleware or route handler
    next();
  } catch (error) {
    // TokenExpiredError means the 15 minutes is up — user needs to refresh
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: '❌ Your access token has expired.',
        hint: 'Call POST /auth/refresh to get a new one.',
      });
    }
    // Any other error means the token was tampered or is just invalid
    return res.status(401).json({ message: '❌ Invalid access token.' });
  }
};

export default protect;
