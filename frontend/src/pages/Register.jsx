// ============================================================
// pages/Register.jsx - Student Registration Page
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.password) {
      return setError('All fields are required.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      // Create user and auto-login
      const { data } = await api.post('/register', formData);
      login(data); // Using auto-login behavior (register route sends JWT)
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-container glass-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">🚀</div>
          <h1>Join GrieveEase</h1>
          <p>Get your voice heard</p>
        </div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Sign up to file and track grievances</p>

        {/* Error Alert */}
        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {/* Register Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Institution Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@university.edu"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            id="register-btn"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Creating Account...</> : '📝 Create Account'}
          </button>
        </form>

        <div className="divider">or</div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
