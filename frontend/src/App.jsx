// ============================================================
// App.jsx - Root Application Component with Routing
// Sets up React Router with public and protected routes
// ============================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

/**
 * ProtectedRoute - Only renders children if user is authenticated
 * Redirects to /login if not logged in
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * PublicRoute - Redirects to /dashboard if already logged in
 * (prevents logged-in users from seeing Login/Register pages)
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/**
 * AppRoutes - Defines all application routes
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Default redirect: / → /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: unknown routes → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

/**
 * App - Root component wrapping everything in AuthProvider + Router
 */
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
