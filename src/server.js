// src/server.js
// This is the entry point of the whole application.
// Its job is simple:
//   1. Load environment variables from .env
//   2. Connect to MongoDB
//   3. Start the Express server
//
// We dont put any business logic here — this file should be short and focused.

// This MUST be the very first import. It loads all the variables
// from .env into process.env before anything else runs.
import 'dotenv/config';

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// We wrap everything in an async function because
// we need to wait for the database connection before starting the server.
// Starting server before DB is connected is bad — requests would fail immediately.
const startServer = async () => {
  await connectDB(); // wait for MongoDB to connect successfuly

  app.listen(PORT, () => {
    console.log('');
    console.log('─────────────────────────────────────────');
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
    console.log(`📦 Environment:       ${process.env.NODE_ENV || 'development'}`);
    console.log('─────────────────────────────────────────');
    console.log('📌 Available Endpoints:');
    console.log(`   POST http://localhost:${PORT}/auth/register`);
    console.log(`   POST http://localhost:${PORT}/auth/login`);
    console.log(`   POST http://localhost:${PORT}/auth/refresh`);
    console.log(`   POST http://localhost:${PORT}/auth/logout`);
    console.log(`   GET  http://localhost:${PORT}/auth/me       🔒`);
    console.log(`   GET  http://localhost:${PORT}/api/dashboard 🔒`);
    console.log('─────────────────────────────────────────');
    console.log('');
  });
};

startServer();
