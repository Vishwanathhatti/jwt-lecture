// src/app.js
// This file creates our Express app and wires everything together —
// middlewares, routes, and the error handler.
// We keep this separate from server.js so that the setup is clean
// and easier to understand at a glance.

import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';

const app = express();

// ── Middlewares ─────────────────────────────────────────────────────────────

// express.json() parses the incoming request body as JSON
// Without this req.body would be undefined and we couldnt read the email or password
app.use(express.json());

// cookie-parser reads the cookies from incoming requests and puts them on req.cookies
// Without this we couldnt read the refreshToken cookie in our auth controller
app.use(cookieParser());

// morgan logs every request to the console in a nice readable format
// e.g: POST /auth/login 200 45ms
// Super helpful when teaching — students can see every request happening in real time
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);       // /auth/register, /auth/login, etc
app.use('/api', protectedRoutes);   // /api/dashboard, /api/posts, etc

// ── Root Route ───────────────────────────────────────────────────────────────
// Just a welcome message that list all available endpoints
// Useful for quick reference when testing in Postman
app.get('/', (req, res) => {
  res.json({
    message: '🎓 JWT Lecture API is running!',
    endpoints: {
      'POST /auth/register':  'Create a new user account',
      'POST /auth/login':     'Login and get your tokens',
      'POST /auth/refresh':   'Get a new access token using the refresh cookie',
      'POST /auth/logout':    'Logout and revoke your refresh token',
      'GET  /auth/me':        '🔒 Get your profile (protected)',
      'GET  /api/dashboard':  '🔒 Private dashboard (protected)',
      'GET  /api/posts':      '🔒 Your posts (protected)',
    },
  });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
// If any route calls next(error), it ends up here
// Its good practice to have one centralized place to handle all unexpected errors
app.use((err, req, res, next) => {
  console.error('💥 Something went wrong:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

export default app;
