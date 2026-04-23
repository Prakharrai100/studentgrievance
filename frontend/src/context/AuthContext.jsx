// ============================================================
// context/AuthContext.jsx - Global Authentication State
// Provides user info and auth functions to all components
// ============================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Auth context
const AuthContext = createContext(null);

/**
 * AuthProvider - Wraps the app and provides auth state
 * Reads JWT and user from localStorage on initial load
 */
export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage (persists across page reloads)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('grievance_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /**
   * login - Stores user info + JWT in state and localStorage
   * @param {object} userData - { _id, name, email, token }
   */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('grievance_user', JSON.stringify(userData));
    localStorage.setItem('grievance_token', userData.token);
  };

  /**
   * logout - Clears user state and localStorage
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('grievance_user');
    localStorage.removeItem('grievance_token');
  };

  /**
   * getToken - Returns the stored JWT token
   */
  const getToken = () => localStorage.getItem('grievance_token');

  const value = {
    user,
    login,
    logout,
    getToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth - Custom hook to consume Auth context
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
