import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { FaUserCircle, FaSpinner } from 'react-icons/fa';

// ==================== HEADER COMPONENT WITH DROPDOWN ====================
function DashboardHeader({ showProfile = true }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  const goToProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      padding: '0 40px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      height: '70px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <img
            src="/Skolify-Logo.jpeg"
            alt="Skolify Logo"
            style={{ width: '63px', height: '63px', objectFit: 'contain', borderRadius: '8px' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span style={{ fontSize: '24px', fontWeight: 700 }}>Skolify</span>
        </div>

        {showProfile && (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <FaUserCircle 
              size={30}
              style={{ 
                cursor: 'pointer',
                color: '#4a5568',
                transition: 'color 0.2s ease'
              }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={(e) => e.currentTarget.style.color = '#2b6cb0'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#4a5568'}
            />
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                background: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: '8px',
                overflow: 'hidden',
                zIndex: 2000,
                minWidth: '180px'
              }}>
                <button 
                  onClick={goToProfile} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px', 
                    width: '100%', 
                    border: 'none', 
                    background: 'none', 
                    textAlign: 'left', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background 0.2s ease',
                    color: '#2d3748'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f7fafc';
                    e.currentTarget.querySelector('span').style.color = '#2b6cb0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.querySelector('span').style.color = '#2d3748';
                  }}
                >
                  <FaUserCircle size={18} />
                  <span>Profile</span>
                </button>
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px', 
                    width: '100%', 
                    border: 'none', 
                    background: 'none', 
                    textAlign: 'left', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderTop: '1px solid #e2e8f0',
                    transition: 'background 0.2s ease',
                    color: '#e53e3e'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fff5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

// ==================== MAINTENANCE PAGE COMPONENT ====================
const MaintenancePage = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      {/* Simple machine-like X animation */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '40px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="machine-x"
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#333',
              fontFamily: 'monospace',
              animation: `stampIn 0.6s ease-out ${i * 0.15}s both`
            }}
          >
            X
          </div>
        ))}
      </div>

      {/* Construction icon */}
      <div style={{
        fontSize: '64px',
        marginBottom: '24px',
        animation: 'bounce 2s infinite'
      }}>
       
      </div>

      {/* Main message */}
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#1a1a1a',
        marginBottom: '16px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        We'll be back soon!
      </h1>

      {/* Subtitle with animated dots */}
      <p style={{
        fontSize: '1.2rem',
        color: '#666',
        maxWidth: '500px',
        lineHeight: 1.6,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        We're currently working on something awesome. Please check back later{dots}
      </p>

      {/* Contact info */}
      <p style={{
        marginTop: '40px',
        fontSize: '0.95rem',
        color: '#999',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        Need immediate assistance?{' '}
        <a 
          href="mailto:skolifyteam@gmail.com" 
          style={{ color: '#007bff', textDecoration: 'none' }}
        >
          Contact us
        </a>
      </p>

      {/* CSS animations injected via style tag */}
      <style>{`
        @keyframes stampIn {
          0% {
            transform: scale(3);
            opacity: 0;
          }
          50% {
            transform: scale(0.8);
            opacity: 1;
          }
          70% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .machine-x:nth-child(odd) {
          color: #2563eb;
        }
        .machine-x:nth-child(even) {
          color: #1e293b;
        }
      `}</style>
    </div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT (MAINTENANCE MODE) ====================
const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-app">
      <DashboardHeader showProfile={true} />
      
      {/* Background Pattern */}
      <div className="background-pattern"></div>

      {/* Main Content - Maintenance Page */}
      <main className="app-main" style={{ paddingTop: '80px' }}>
        <div className="app-container">
          
          {/* Maintenance Page Content */}
          <MaintenancePage />

          {/* Contact Support */}
          <div className="contact-support">
            <p className="contact-message">
              Need help? Contact our support team at{' '}
              <a href="mailto:skolifyteam@gmail.com" className="support-link">
                skolifyteam@gmail.com
              </a>
            </p>
          </div>

          {/* Footer */}
          <footer className="dashboard-footer">
            <div className="footer-links">
              <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms & Conditions</a>
              <span className="footer-separator">|</span>
              <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
            </div>
            <p className="copyright">© {new Date().getFullYear()} Skolify. All rights reserved.</p>
          </footer>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;