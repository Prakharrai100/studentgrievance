// ============================================================
// models/Student.js - Mongoose schema for Student (User)
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * StudentSchema - Defines the shape of a student document
 * - name: Full name of the student
 * - email: Unique email address (used for login)
 * - password: Hashed password (never stored in plain text)
 */
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields automatically
  }
);

// ── Pre-save Hook: Hash password before saving ─────────────────
studentSchema.pre('save', async function (next) {
  // Only hash if password was modified (prevents re-hashing on other updates)
  if (!this.isModified('password')) return next();

  // Generate salt with cost factor 10 (good balance of speed vs security)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method: Compare passwords ────────────────────────
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
