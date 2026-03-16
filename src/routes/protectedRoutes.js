// src/routes/protectedRoutes.js
// These are example routes that require a valid access token.
// We use them in the lecture to show students how easy it is
// to protect any route — just drop the `protect` middleware in front.

import { Router } from 'express';
import protect from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard — simulates a private dashboard page
// Only accessible if you have a valid access token
router.get('/dashboard', protect, (req, res) => {
  res.status(200).json({
    message: '✅ Welcome to the Dashboard!',
    // req.user is available because `protect` middleware decoded the token for us
    loggedInAs: req.user,
    data: {
      totalUsers: 120,
      revenue: '$5,400',
      activeSubscriptions: 85,
    },
  });
});

// GET /api/posts — simulates fetching posts for the authenticated user
router.get('/posts', protect, (req, res) => {
  res.status(200).json({
    message: `✅ Posts fetched for: ${req.user.name}`,
    posts: [
      { id: 1, title: 'What is JWT?', author: req.user.name },
      { id: 2, title: 'Access vs Refresh Tokens', author: req.user.name },
      { id: 3, title: 'How bcrypt works', author: req.user.name },
    ],
  });
});

export default router;
