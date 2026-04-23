// ============================================================
// server.js - Main entry point for the Express application
// ============================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ── Middleware ────────────────────────────────────────────────
// Parse incoming JSON requests
app.use(express.json());

// Enable Cross-Origin Resource Sharing (for React frontend)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// ── Routes ────────────────────────────────────────────────────
// Auth routes: /api/register and /api/login
app.use('/api', require('./routes/auth'));

// Grievance routes (protected): full CRUD
app.use('/api/grievances', require('./routes/grievances'));

// ── Root Health Check ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🎓 Student Grievance API is running!' });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});
