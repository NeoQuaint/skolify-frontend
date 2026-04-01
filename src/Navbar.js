// src/components/Navbar/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ handleLogout }) => {
  const userEmail = localStorage.getItem('userEmail') || 'User';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <img 
            src="/SKOLIFY LOGO.jpeg" 
            alt="Skolify Logo" 
            className="nav-logo-image"
          />
          <span className="nav-logo-text">Skolify</span>
        </div>
        
        <div className="nav-user-section">
          <span className="nav-user-email">{userEmail}</span>
          <button onClick={handleLogout} className="nav-logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;