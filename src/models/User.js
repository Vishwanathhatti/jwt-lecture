// src/models/User.js
// This is the User model — basically a blueprint that tells MongoDB
// what a User document should look like when its saved.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// userSchema defines the structure of each user in the database
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,       // No two users can have same email in our system
      lowercase: true,
      trim: true,
    },

    // ⚠️ we NEVER store the plain text password — only a bcrypt hash of it
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
  },
  {
    // This automaticaly adds `createdAt` and `updatedAt` fields to every document
    timestamps: true,
  }
);

// Mongoose Middleware / Pre-save Hook
// This will runs automaticaly BEFORE any user document is saved to the database.
// We use this to hash the password so we dont have to do it manually every time.
userSchema.pre('save', async function () {
  // "this" here refers to the current user document being saved
  // If the password wasnt changed, we skip hashing (no need to re-hash it)
  if (!this.isModified('password')) return;

  // genSalt(10) creates a random "salt" value — it gets mixed with the password
  // before hashing. This way even if two users have same password,
  // their hashes will be completely different. Pretty cool right?
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// comparePassword is a custom method we can call on any user instance
// e.g: user.comparePassword("mypassword123")
// It returns true if the password matches, false otherwize
userSchema.methods.comparePassword = async function (plainPassword) {
  // bcrypt.compare() re-hashes the plainPassword using the same salt
  // and then checks if they match — we never actually decrypt the hash
  return await bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
