// src/middleware/validate.js
// Simple request body validation middleware.
// We keep this separate so our controllers stay clean
// and focused only on business logic.
//
// Each function here is a middleware — it runs before the controller
// and blocks the request if the input is invalid.

// helper — checks if a string is a valid email format
const isValidEmail = (email) => {
  // a simple regex to catch most invalid emails
  // its not perfect but good enough for teaching purpose
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// validateRegister — validates POST /auth/register body
// Checks: name, email, password are present and in correct format
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // name must be present and at least 2 characters
  if (!name || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters.');
  }

  // email must be present and valid format
  if (!email) {
    errors.push('Email is required.');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }

  // password must be present and at least 6 characters
  if (!password) {
    errors.push('Password is required.');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  // if there are any errors, stop the request here and return them all at once
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  // everything looks good, move to the next handler (the controller)
  next();
};

// validateLogin — validates POST /auth/login body
// Checks: email and password are present
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required.');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!password) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};
