// src/routes/protectedRoutes.js
// These are example routes that require a valid access token.
// We use them in the lecture to show students how easy it is
// to protect any route — just drop the `protect` middleware in front.

import { Router } from 'express';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard — simulates a private dashboard page
// Only accessible if you have a valid access token
router.get('/dashboard', protect, async (req, res) => {
  // Fetch data BEFORE building the response object — statements can't live inside an object literal
  const users = await User.find();



  res.status(200).json({
    message: '✅ Welcome to the Dashboard!',
    // req.user is available because `protect` middleware decoded the token for us
    loggedInAs: req.user,
    data: {
      totalUsers: users.length,
    },
  });
});


export default router;
