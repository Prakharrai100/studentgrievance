// ============================================================
// pages/Login.jsx - Student Login Page
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/login', formData);
      login(data); // Save user + JWT to context/localStorage
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-container glass-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">🎓</div>
          <h1>GrieveEase</h1>
          <p>Student Grievance Portal</p>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to manage your grievances</p>

        {/* Error Alert */}
        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
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
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing In...</> : '🔐 Sign In'}
          </button>
        </form>

        <div className="divider">or</div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          New here?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>Create an account →</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
