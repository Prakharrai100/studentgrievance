// ============================================================
// routes/auth.js - Authentication Routes
// POST /api/register  - Register a new student
// POST /api/login     - Login with email & password
// ============================================================

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

/**
 * generateToken - Creates a signed JWT token for a student
 * @param {string} id - MongoDB ObjectId of the student
 * @returns {string} - JWT token valid for 7 days
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ── POST /api/register ────────────────────────────────────────
/**
 * Register a new student account
 * Body: { name, email, password }
 * Returns: { _id, name, email, token }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate all required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if a student with this email already exists
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    // Create new student (password hashing happens in model's pre-save hook)
    const student = await Student.create({ name, email, password });

    // Return student info + JWT token
    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      token: generateToken(student._id),
      message: 'Registration successful!'
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ── POST /api/login ───────────────────────────────────────────
/**
 * Login with email and password
 * Body: { email, password }
 * Returns: { _id, name, email, token }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find student by email (case-insensitive due to lowercase in schema)
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare provided password with the hashed password in DB
    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return student info + JWT token
    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      token: generateToken(student._id),
      message: 'Login successful!'
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
