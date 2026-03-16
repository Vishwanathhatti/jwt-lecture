// src/config/db.js
// This file handles the connection to our MongoDB database using Mongoose.
// We put this in its own file so we can easily reuse it and its
// not cluttering our main server.js file.

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // mongoose.connect() returns a Promise so we await it
    // (missing comma above is fine, just means we wait for it to finish)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // conn.connection.host gives us the host name so we know where we connected
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If we can't connect to the database there is no point running the server
    // so we just exit the process with code 1 (means something went wrong)
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
