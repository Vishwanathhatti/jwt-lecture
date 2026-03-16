// src/models/RefreshToken.js
// This model stores all the active refresh tokens in MongoDB.
//
// You might wonder — why do we even store refresh tokens in the database?
// Here's the thing: access tokens are stateless. We don't keep track of them anywhere,
// we just verify their signature and trust them. But the problem with that is
// we cant revoke them once they're issued.
//
// Refresh tokens are different. We stores them in the database, so when
// a user logs out, we can delete the token and its gone — nobody can use it anymore.
// This makes our logout actually work properly.

import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  // The full JWT refresh token string
  token: {
    type: String,
    required: true,
  },

  // This links the token to a specific user
  // Its basically like a foreign key in SQL — references the User model
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // When this token should expire — we match this with the JWT expiry (7 days)
  expiresAt: {
    type: Date,
    required: true,
  },
});

// TTL (Time To Live) Index
// This is a really nice MongoDB feature — it automaticaly deletes documents
// once their `expiresAt` date has passed. So expired tokens clean themselves up!
// We dont need to write any extra code or cron job for this.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
