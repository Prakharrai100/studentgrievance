// ============================================================
// components/GrievanceForm.jsx - Form to Submit New Grievance
// ============================================================

import React, { useState } from 'react';
import api from '../api/axios';

/**
 * GrievanceForm - Renders the form for submitting a grievance
 * @param {function} onSuccess - Called after successful submission (refreshes list)
 */
const GrievanceForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['Academic', 'Hostel', 'Transport', 'Other'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.description.trim()) {
      return setError('Title and description are required.');
    }

    setLoading(true);
    try {
      await api.post('/grievances', formData);
      setSuccess('✅ Grievance submitted successfully!');
      // Reset form
      setFormData({ title: '', description: '', category: 'Academic' });
      onSuccess(); // Trigger parent to refresh grievance list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit grievance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card section-card slide-up">
      <h3 className="section-title">📝 Submit Grievance</h3>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            id="title"
            type="text"
            className="form-input"
            placeholder="Brief title of your grievance"
            value={formData.title}
            onChange={handleChange}
            maxLength={150}
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category" className="form-label">Category</label>
          <select
            id="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            className="form-textarea"
            placeholder="Describe your grievance in detail..."
            value={formData.description}
            onChange={handleChange}
            maxLength={1000}
            rows={4}
            required
          />
        </div>

        <button
          id="submit-grievance-btn"
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading ? <><span className="spinner" /> Submitting...</> : '🚀 Submit Grievance'}
        </button>
      </form>
    </div>
  );
};

export default GrievanceForm;
