// ============================================================
// middleware/auth.js - JWT Authentication Middleware
// ============================================================

const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

/**
 * protect - Express middleware that verifies the JWT token
 *
 * Expects: Authorization: Bearer <token>
 *
 * On success: attaches `req.user` (student document without password)
 * On failure: returns 401 Unauthorized
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature and expiry
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request object (exclude password)
      req.user = await Student.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next(); // Proceed to the next middleware / route handler
    } catch (error) {
      console.error('JWT Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
