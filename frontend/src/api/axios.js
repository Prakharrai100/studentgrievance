// ============================================================
// api/axios.js - Axios Instance with JWT Interceptor
// Automatically attaches the JWT token to every request
// ============================================================

import axios from 'axios';

/**
 * Create a custom Axios instance with the base URL
 * During development, Vite proxy routes /api → http://localhost:5000
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ────────────────────────────────────────
// Automatically attach JWT from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('grievance_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────
// Handle 401 Unauthorized globally (token expired / invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth data and redirect to login
      localStorage.removeItem('grievance_user');
      localStorage.removeItem('grievance_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
