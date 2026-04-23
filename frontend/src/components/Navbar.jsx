// ============================================================
// components/Navbar.jsx - Top Navigation Bar
// Shows brand, user greeting, and logout button
// ============================================================

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <div className="brand-icon">🎓</div>
        <span>GrieveEase</span>
      </div>

      {/* User info + Logout */}
      <div className="navbar-user">
        {user && (
          <span className="navbar-greeting">
            Hello, <strong>{user.name.split(' ')[0]}</strong>
          </span>
        )}
        <button
          id="logout-btn"
          className="btn btn-secondary btn-sm"
          onClick={handleLogout}
          title="Sign out"
        >
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
