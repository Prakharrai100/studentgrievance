// ============================================================
// components/GrievanceCard.jsx - Card for a Single Grievance
// Shows details and handles Delete + inline Edit
// ============================================================

import React, { useState } from 'react';
import api from '../api/axios';

/**
 * GrievanceCard - Displays a single grievance with edit/delete actions
 * @param {object} grievance - The grievance data object
 * @param {function} onRefresh - Callback to reload grievances after action
 */
const GrievanceCard = ({ grievance, onRefresh }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    title: grievance.title,
    description: grievance.description,
    category: grievance.category,
    status: grievance.status,
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Academic', 'Hostel', 'Transport', 'Other'];

  // Format date nicely
  const formattedDate = new Date(grievance.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  // ── Delete Handler ──────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this grievance?')) return;
    setDeleting(true);
    try {
      await api.delete(`/grievances/${grievance._id}`);
      onRefresh(); // Reload the list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Update Handler ──────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put(`/grievances/${grievance._id}`, editData);
      setShowEdit(false);
      onRefresh(); // Reload the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.id]: e.target.value });
  };

  return (
    <>
      {/* ── Grievance Card ───────────────────────────────────── */}
      <div className="glass-card grievance-card fade-in">
        {/* Header: title + badges */}
        <div className="grievance-card-header">
          <span className="grievance-title">{grievance.title}</span>
        </div>

        {/* Short description */}
        <p className="grievance-desc">{grievance.description}</p>

        {/* Meta: category, status, date */}
        <div className="grievance-meta">
          <span className="badge badge-category">
            {getCategoryIcon(grievance.category)} {grievance.category}
          </span>
          <span className={`badge ${grievance.status === 'Resolved' ? 'badge-resolved' : 'badge-pending'}`}>
            {grievance.status === 'Resolved' ? '✅' : '⏳'} {grievance.status}
          </span>
          <span className="grievance-date">{formattedDate}</span>
        </div>

        {/* Action Buttons */}
        <div className="grievance-actions">
          <button
            id={`edit-btn-${grievance._id}`}
            className="btn btn-secondary btn-sm"
            onClick={() => setShowEdit(true)}
          >
            ✏️ Edit
          </button>
          <button
            id={`delete-btn-${grievance._id}`}
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <span className="spinner" /> : '🗑️ Delete'}
          </button>
          {/* Quick Resolve toggle */}
          {grievance.status === 'Pending' && (
            <button
              id={`resolve-btn-${grievance._id}`}
              className="btn btn-success btn-sm"
              onClick={async () => {
                try {
                  await api.put(`/grievances/${grievance._id}`, { status: 'Resolved' });
                  onRefresh();
                } catch {
                  alert('Failed to resolve.');
                }
              }}
            >
              ✅ Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────── */}
      {showEdit && (
        <div className="edit-overlay" onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h3>✏️ Edit Grievance</h3>
              <button className="modal-close" onClick={() => setShowEdit(false)}>✕</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  value={editData.title}
                  onChange={handleEditChange}
                  maxLength={150}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">Category</label>
                <select id="category" className="form-select" value={editData.category} onChange={handleEditChange}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status" className="form-label">Status</label>
                <select id="status" className="form-select" value={editData.status} onChange={handleEditChange}>
                  <option value="Pending">⏳ Pending</option>
                  <option value="Resolved">✅ Resolved</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  className="form-textarea"
                  value={editData.description}
                  onChange={handleEditChange}
                  rows={4}
                  maxLength={1000}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? <><span className="spinner" /> Saving...</> : '💾 Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Helper: map category to emoji icon
const getCategoryIcon = (category) => {
  const icons = { Academic: '📚', Hostel: '🏠', Transport: '🚌', Other: '📌' };
  return icons[category] || '📌';
};

export default GrievanceCard;
