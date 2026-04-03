import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import './Header.css?v=2';


const Header = ({ showProfile = true, logoutOnly = false }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const profileIconRef = useRef(null);

  const goToLandingPage = () => {
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/dashboard')}>
          <img 
            src="/SKOLIFY LOGO.jpeg" 
            alt="Skolify Logo" 
            className="logo-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <span className="logo-text">Skolify</span>
        </div>
        
        {logoutOnly ? (
          <div className="profile-container">
            <button 
              className="logout-icon"
              onClick={handleLogout}
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        ) : showProfile && (
          <div className="profile-container">
            <button 
              ref={profileIconRef}
              className="profile-icon"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <FaUserCircle />
            </button>
            {showProfileMenu && (
              <div className="profile-menu" ref={profileMenuRef}>
                <div className="profile-header">
                  <FaUserCircle className="profile-menu-icon" />
                  <div>
                    <h4>Student Profile</h4>
                    <p>student@example.com</p>
                  </div>
                </div>
                <div className="profile-menu-items">
                  <button className="profile-menu-item" onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}>
                    My Profile
                  </button>
                  <button className="profile-menu-item" onClick={() => { setShowProfileMenu(false); alert('Applications page coming soon!'); }}>
                    My Applications
                  </button>
                  <button className="profile-menu-item" onClick={() => { setShowProfileMenu(false); alert('Settings page coming soon!'); }}>
                    Settings
                  </button>
                  <button className="profile-menu-item logout-btn" onClick={goToLandingPage}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;