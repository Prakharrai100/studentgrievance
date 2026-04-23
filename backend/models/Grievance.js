// ============================================================
// models/Grievance.js - Mongoose schema for a Grievance
// ============================================================

const mongoose = require('mongoose');

/**
 * GrievanceSchema - Defines the shape of a grievance document
 * - title: Short title of the grievance
 * - description: Detailed description
 * - category: One of Academic | Hostel | Transport | Other
 * - status: Pending (default) or Resolved
 * - date: Auto-generated timestamp when created
 * - userId: Reference to the Student who filed this grievance
 */
const grievanceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Academic', 'Hostel', 'Transport', 'Other'],
        message: 'Category must be Academic, Hostel, Transport, or Other'
      }
    },
    status: {
      type: String,
      enum: ['Pending', 'Resolved'],
      default: 'Pending'  // All new grievances start as Pending
    },
    date: {
      type: Date,
      default: Date.now   // Auto-set when document is created
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',     // Relation to Student model
      required: true
    }
  },
  {
    timestamps: true      // Adds createdAt and updatedAt
  }
);

// Index for faster search by title
grievanceSchema.index({ title: 'text' });

module.exports = mongoose.model('Grievance', grievanceSchema);
