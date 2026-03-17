// src/routes/authRoutes.js
// Here we define all the routes related to authentication.
// Each route is mapped to a function in our authController.
// Keeping routes separate like this makes the codebase much cleaner to navigate.

import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';

const router = Router();

// Public routes — no token needed to access these
// Notice: validation middleware runs BEFORE the controller (left to right)
router.post('/register', validateRegister, register);  // validate → create account
router.post('/login', validateLogin, login);            // validate → login and get tokens
router.post('/refresh', refresh);    // use cookie to get new access token
router.post('/logout', logout);      // revoke refresh token and clear cookie

// Protected route — access token is required
// Notice how we pass `protect` before `getMe`
// Express runs middlewares left to right, so protect runs first
router.get('/me', protect, getMe);   // get the currently logged in user

export default router;
