// ============================================================
// routes/grievances.js - Grievance CRUD Routes (Protected)
// All routes require a valid JWT token via the protect middleware
//
// POST   /api/grievances            - Create a new grievance
// GET    /api/grievances            - Get all grievances for logged-in user
// GET    /api/grievances/search     - Search grievances by title
// GET    /api/grievances/:id        - Get a single grievance by ID
// PUT    /api/grievances/:id        - Update a grievance (title/desc/status)
// DELETE /api/grievances/:id        - Delete a grievance
// ============================================================

const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const { protect } = require('../middleware/auth');

// Apply the protect middleware to ALL routes in this router
router.use(protect);

// ── POST /api/grievances ─────────────────────────────────────
/**
 * Create a new grievance
 * Body: { title, description, category }
 * Auth: Required
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Please provide title, description, and category' });
    }

    // Create grievance linked to the currently logged-in user
    const grievance = await Grievance.create({
      title,
      description,
      category,
      userId: req.user._id  // Set from JWT token via protect middleware
    });

    res.status(201).json({ grievance, message: 'Grievance submitted successfully!' });
  } catch (error) {
    console.error('Create Grievance Error:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while creating grievance' });
  }
});

// ── GET /api/grievances/search ────────────────────────────────
/**
 * Search grievances by title (case-insensitive substring match)
 * Query: ?title=<search_term>
 * Auth: Required
 * NOTE: This route MUST be defined before /:id to avoid conflict
 */
router.get('/search', async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ message: 'Please provide a search title query parameter' });
    }

    // Use regex for case-insensitive partial match on title
    const grievances = await Grievance.find({
      userId: req.user._id,
      title: { $regex: title, $options: 'i' }
    }).sort({ date: -1 }); // Most recent first

    res.json({ count: grievances.length, grievances });
  } catch (error) {
    console.error('Search Grievance Error:', error.message);
    res.status(500).json({ message: 'Server error while searching' });
  }
});

// ── GET /api/grievances ───────────────────────────────────────
/**
 * Get all grievances for the currently logged-in user
 * Auth: Required
 */
router.get('/', async (req, res) => {
  try {
    // Filter by userId so students only see their own grievances
    const grievances = await Grievance.find({ userId: req.user._id })
      .sort({ date: -1 }); // Most recent first

    res.json({ count: grievances.length, grievances });
  } catch (error) {
    console.error('Get Grievances Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching grievances' });
  }
});

// ── GET /api/grievances/:id ────────────────────────────────────
/**
 * Get a single grievance by its MongoDB ID
 * Auth: Required — must own the grievance
 */
router.get('/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findOne({
      _id: req.params.id,
      userId: req.user._id  // Ensure ownership
    });

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    res.json({ grievance });
  } catch (error) {
    console.error('Get Grievance Error:', error.message);
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid grievance ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching grievance' });
  }
});

// ── PUT /api/grievances/:id ────────────────────────────────────
/**
 * Update a grievance (title, description, category, status)
 * Body: { title?, description?, category?, status? }
 * Auth: Required — must own the grievance
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category, status } = req.body;

    // Find the grievance and verify ownership
    const grievance = await Grievance.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Update only the fields provided in the request body
    if (title !== undefined) grievance.title = title;
    if (description !== undefined) grievance.description = description;
    if (category !== undefined) grievance.category = category;
    if (status !== undefined) grievance.status = status;

    // Save triggers validation again
    const updated = await grievance.save();

    res.json({ grievance: updated, message: 'Grievance updated successfully!' });
  } catch (error) {
    console.error('Update Grievance Error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid grievance ID format' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while updating grievance' });
  }
});

// ── DELETE /api/grievances/:id ─────────────────────────────────
/**
 * Delete a grievance by ID
 * Auth: Required — must own the grievance
 */
router.delete('/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id  // Ensure only the owner can delete
    });

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    res.json({ message: 'Grievance deleted successfully!' });
  } catch (error) {
    console.error('Delete Grievance Error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid grievance ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting grievance' });
  }
});

module.exports = router;
