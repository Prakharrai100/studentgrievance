// ============================================================
// pages/Dashboard.jsx - Student Dashboard
// Features: Submit new grievance, list all grievances, search,
// stats, inline editing, deleting, and marking as resolved.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/**
 * EditModal Component
 * Simple modal to edit an existing grievance's title, description, category, and status.
 */
const EditModal = ({ grievance, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: grievance.title,
    description: grievance.description,
    category: grievance.category,
    status: grievance.status,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put(`/grievances/${grievance._id}`, formData);
      onSave(); // Trigger dashboard refresh
      onClose(); // Close modal
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-overlay" onClick={(e) => e.target.className === 'edit-overlay' && onClose()}>
      <div className="edit-modal">
        <div className="edit-modal-header">
          <h3>Edit Grievance</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title</label>
            <input id="title" type="text" className="form-input" value={formData.title} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label htmlFor="category" className="form-label">Category</label>
              <select id="category" className="form-select" value={formData.category} onChange={handleChange}>
                <option value="Academic">Academic</option>
                <option value="Hostel">Hostel</option>
                <option value="Transport">Transport</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="form-label">Status</label>
              <select id="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea id="description" className="form-textarea" value={formData.description} onChange={handleChange} required />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * GrievanceCard Component
 * Displays individual grievance details and action buttons.
 */
const GrievanceCard = ({ g, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derive styles based on status / category
  const isPending = g.status === 'Pending';
  const statusBadge = isPending ? 'badge-pending' : 'badge-resolved';

  const catColors = {
    Academic: { bg: 'rgba(56, 189, 248, 0.15)', text: '#7dd3fc', border: 'rgba(56, 189, 248, 0.3)' },
    Hostel: { bg: 'rgba(244, 114, 182, 0.15)', text: '#f9a8d4', border: 'rgba(244, 114, 182, 0.3)' },
    Transport: { bg: 'rgba(163, 230, 53, 0.15)', text: '#d9f99d', border: 'rgba(163, 230, 53, 0.3)' },
    Other: { bg: 'rgba(156, 163, 175, 0.15)', text: '#d1d5db', border: 'rgba(156, 163, 175, 0.3)' }
  };
  const catStyle = catColors[g.category] || catColors['Other'];

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this grievance? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/grievances/${g._id}`);
      onRefresh(); // Refresh list after deletion
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete grievance.');
      setIsDeleting(false); // Reset state if failed (if success, component unmounts)
    }
  };

  const handleResolve = async () => {
    try {
      await api.put(`/grievances/${g._id}`, { status: 'Resolved' });
      onRefresh();
    } catch (err) {
      alert('Failed to mark as resolved.');
    }
  };

  return (
    <>
      <div className={`glass-card grievance-card ${!isPending ? 'opacity-80' : ''}`}>
        <div className="grievance-card-header">
          <h3 className="grievance-title">{g.title}</h3>
          {!isPending && <span title="Resolved" style={{ fontSize: '1.2rem' }}>✅</span>}
        </div>

        <p className="grievance-desc">{g.description}</p>

        <div className="grievance-meta">
          <span className={`badge ${statusBadge}`}>
            {isPending ? '⏳ Pending' : '✓ Resolved'}
          </span>
          <span className="badge" style={{ background: catStyle.bg, color: catStyle.text, borderColor: catStyle.border }}>
            {g.category}
          </span>
          <span className="grievance-date">
            Filed: {new Date(g.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="grievance-actions">
          {/* Edit Button (disabled if resolved) */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsEditing(true)}
            disabled={!isPending}
            title={!isPending ? "Cannot edit resolved grievance" : ""}
          >
            ✏️ Edit
          </button>

          {/* Delete Button (disabled if resolved) */}
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={isDeleting || !isPending}
            title={!isPending ? "Cannot delete resolved grievance" : ""}
          >
            {isDeleting ? '🗑️...' : '🗑️ Delete'}
          </button>

          {/* Quick Resolve Button */}
          {isPending && (
            <button className="btn btn-success btn-sm" onClick={handleResolve} style={{ marginLeft: 'auto' }}>
              ✓ Mark Resolved
            </button>
          )}
        </div>
      </div>

      {isEditing && <EditModal grievance={g} onClose={() => setIsEditing(false)} onSave={onRefresh} />}
    </>
  );
};

/**
 * Dashboard Component (Main Page)
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Submit form state
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Academic' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' }); // { type: 'success' | 'error', text: '...' }

  // ── 1. Fetch Grievances ──────────────────────────────────────
  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const { data } = await api.get('/grievances');
      setGrievances(data.grievances);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load grievances from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  // ── 2. Handle Search ─────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      // If empty search, fetch all
      fetchGrievances();
      return;
    }

    setIsSearching(true);
    setFetchError('');
    try {
      const { data } = await api.get(`/grievances/search?title=${encodeURIComponent(searchQuery)}`);
      setGrievances(data.grievances);
    } catch (err) {
      setFetchError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchGrievances();
  };

  // ── 3. Handle Submit ─────────────────────────────────────────
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: '', text: '' });

    if (!formData.title.trim() || !formData.description.trim()) {
      return setSubmitMessage({ type: 'error', text: 'Title and description cannot be empty.' });
    }

    setIsSubmitting(true);
    try {
      await api.post('/grievances', formData);
      // Reset form
      setFormData({ title: '', description: '', category: 'Academic' });
      // Show success msg
      setSubmitMessage({ type: 'success', text: 'Grievance submitted successfully!' });
      // Refresh list
      fetchGrievances();

      // Clear success msg after 4 seconds
      setTimeout(() => setSubmitMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit grievance.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 4. Handle Logout ─────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── 5. Derived Stats ─────────────────────────────────────────
  const totalCount = grievances.length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;
  const pendingCount = totalCount - resolvedCount;

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar fade-in">
        <div className="navbar-brand">
          <div className="brand-icon">🎓</div>
          <span>GrieveEase</span>
        </div>
        <div className="navbar-user">
          <span className="navbar-greeting">
            Hello, <strong>{user?.name?.split(' ')[0]}</strong>
          </span>
          <button id="logout-btn" onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout 🚪
          </button>
        </div>
      </nav>

      <main className="dashboard-page slide-up">
        {/* ── Header ── */}
        <header className="dashboard-header">
          <h2>Student Dashboard</h2>
          <p>Track your academic and campus-related issues in real-time.</p>
        </header>

        {/* ── Stats Bar ── */}
        <div className="stats-bar">
          <div className="glass-card stat-item">
            <div className="stat-number">{totalCount}</div>
            <div className="stat-label">Total Filed</div>
          </div>
          <div className="glass-card stat-item">
            <div className="stat-number" style={{ background: 'var(--color-pending)', WebkitBackgroundClip: 'text' }}>{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="glass-card stat-item">
            <div className="stat-number" style={{ background: 'var(--color-resolved)', WebkitBackgroundClip: 'text' }}>{resolvedCount}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* ── Left Column: Submit Form ── */}
          <aside>
            <div className="glass-card section-card" style={{ position: 'sticky', top: '100px' }}>
              <h3 className="section-title">✍️ Submit New Grievance</h3>

              {submitMessage.text && (
                <div className={`alert ${submitMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                  {submitMessage.text}
                </div>
              )}

              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="title" className="form-label">Subject / Title</label>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    placeholder="Brief summary of issue"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    maxLength={150}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select id="category" className="form-select" value={formData.category} onChange={handleFormChange}>
                    <option value="Academic">Academic</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Transport">Transport</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">Detailed Description</label>
                  <textarea
                    id="description"
                    className="form-textarea"
                    placeholder="Provide all necessary details to help resolve the issue quickly..."
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                    maxLength={1000}
                  />
                </div>

                <button id="submit-grievance-btn" type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                  {isSubmitting ? <><span className="spinner" /> Submitting...</> : '🚀 Submit Grievance'}
                </button>
              </form>
            </div>
          </aside>

          {/* ── Right Column: Grievances List ── */}
          <section>
            <div className="glass-card section-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginbottom: '1.25rem' }}>
                <h3 className="section-title" style={{ margin: 0, flex: 0 }} nowrap="true">📋 My Grievances</h3>

                {/* Refresh Data button */}
                <button onClick={fetchGrievances} className="btn btn-secondary btn-sm" title="Refresh list" disabled={loading}>
                  🔄
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  id="search-input"
                  type="text"
                  className="form-input search-input"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button id="search-btn" type="submit" className="btn btn-primary btn-sm" disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                  {searchQuery && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={clearSearch}>
                      Clear
                    </button>
                  )}
                </div>
              </form>

              {/* Error Message */}
              {fetchError && (
                <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{fetchError}</span>
                  <button onClick={fetchGrievances} className="btn btn-secondary btn-sm">Retry</button>
                </div>
              )}

              {/* List Content */}
              <div className="grievance-list">
                {loading ? (
                  <div className="empty-state">
                    <span className="spinner" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent', width: '30px', height: '30px' }} />
                    <p style={{ marginTop: '1rem' }}>Loading your grievances...</p>
                  </div>
                ) : grievances.length === 0 ? (
                  <div className="empty-state fade-in">
                    <div className="empty-icon">📭</div>
                    <h4>No grievances found</h4>
                    <p>{searchQuery ? "Try adjusting your search query." : "You haven't submitted any grievances yet."}</p>
                  </div>
                ) : (
                  grievances.map(g => (
                    <GrievanceCard key={g._id} g={g} onRefresh={fetchGrievances} />
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
