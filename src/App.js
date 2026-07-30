import API_URL from './config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Background from './Background';
import Dashboard from './Dashboard';
import PaymentPage from './PaymentPage';
import ProfilePage from './ProfilePage';
import ExpressApply from './ExpressApply';
import Accommodation from './Accommodation';
import Bursary from './Bursary';
import JuneSpecial from './JuneSpecial';
import FreemiumFriday from './FreemiumFriday';
import QuickApply from './QuickApply';
import PaymentSuccess from './Pages/PaymentSuccess';
import PaymentCancel from './Pages/PaymentCancel';
import PaymentError from './Pages/PaymentError';

// ==================== API HELPER WITH TOKEN REFRESH ====================
const apiFetch = async (endpoint, options = {}) => {
  let token = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  const makeRequest = async (retryToken, isRetry = false) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(retryToken && { 'Authorization': `Bearer ${retryToken}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (response.status === 401 && refreshToken && !isRetry) {
      console.log('🔄 Token expired, attempting refresh...');
      
      try {
        const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success && refreshData.token) {
          localStorage.setItem('authToken', refreshData.token);
          token = refreshData.token;
          console.log('✅ Token refreshed successfully');
          
          return await makeRequest(token, true);
        } else {
          console.log('❌ Token refresh failed, redirecting to login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Session expired. Please sign in again.');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh error:', refreshError);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Session expired. Please sign in again.');
      }
    }
    
    return response;
  };
  
  return makeRequest(token);
};

// ==================== EVENT TRACKING ====================
const trackEvent = async (eventType, eventData = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    await fetch(`${API_URL}/api/track-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ eventType, eventData })
    });
  } catch (e) {
    // Silent fail
  }
};

// ==================== PROTECTED ROUTE ====================
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function Header({ showProfile = true }) {
  const navigate = useNavigate();

  return (
    <header style={{
      padding: '0px 40px',
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
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img
            src="/Skolify-Logo.jpeg"
            alt="Skolify Logo"
            style={{ width: '63px', height: '63px', objectFit: 'contain', borderRadius: '8px' }}
          />
          <span style={{ fontSize: '24px', fontWeight: 700 }}>Skolify</span>
        </div>
      </div>
    </header>
  );
}

// Forgot Password Modal Component
function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message || 'Password reset link sent to your email!');
        setEmail('');
        setTimeout(() => {
          onClose();
          setMessage('');
        }, 3000);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-modal">
      <div className="forgot-password-overlay" onClick={onClose}></div>
      <div className="forgot-password-content">
        <div className="forgot-password-header">
          <h3>Reset Your Password</h3>
          <button className="close-forgot-password" onClick={onClose}>×</button>
        </div>
        <div className="forgot-password-body">
          <p>Enter your email address and we'll send you a link to reset your password.</p>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="signin-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <button type="submit" className="signin-submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Reset Password Component
function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('token');
    
    if (resetToken) {
      setToken(resetToken);
      verifyToken(resetToken);
    } else {
      setVerifying(false);
      setError('No reset token provided. Please request a new password reset link.');
    }
  }, [location]);

  const verifyToken = async (resetToken) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-reset-token?token=${resetToken}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setValidToken(true);
        setError('');
      } else {
        setError(data.error || 'Invalid or expired reset link. Please request a new one.');
        setValidToken(false);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setValidToken(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="app">
        <Header />
        <main className="app-main">
          <div className="app-container">
            <div className="reset-password-container">
              <div className="loading-spinner">Verifying reset link...</div>
            </div>
          </div>
        </main>
        <Background />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <div className="app-container">
          <div className="reset-password-container">
            <div className="reset-password-card">
              <h2>Create New Password</h2>
              
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}
              
              {validToken && !message ? (
                <form onSubmit={handleSubmit}>
                  <div className="signin-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  
                  <div className="signin-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  
                  <button type="submit" className="signin-submit-btn" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              ) : !validToken && !message ? (
                <div className="error-container">
                  <p>{error}</p>
                  <button className="back-to-login-btn" onClick={() => navigate('/')}>
                    Back to Login
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Background />
    </div>
  );
}

function WelcomeScreen() {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleInitialized = useRef(false);
  const googleScriptLoaded = useRef(false);

  const GOOGLE_CLIENT_ID = '653263265768-dnbqe08an6rei7pfacpsnc96mqfinr8t.apps.googleusercontent.com';

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
    setCheckingAuth(false);
  }, [navigate]);

  useEffect(() => {
    trackEvent('page_view', { page: 'landing' });
  }, []);

  // Initialize Google Identity Services ONCE when component mounts
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && window.google.accounts && !googleInitialized.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: false,
          });
          googleInitialized.current = true;
          console.log('Google Identity Services initialized successfully');
        } catch (error) {
          console.error('Failed to initialize Google Sign-In:', error);
        }
      }
    };

    // If script already loaded
    if (window.google && window.google.accounts) {
      initializeGoogle();
      return;
    }

    // Load script if not already loading
    if (!googleScriptLoaded.current && !document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      googleScriptLoaded.current = true;
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogle();
      };
      script.onerror = () => {
        console.error('Failed to load Google Sign-In script');
        googleScriptLoaded.current = false;
      };
      document.body.appendChild(script);
    }

    // Cleanup on unmount
    return () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []); // Empty dependency array - only run on mount

  const handleGoogleSignIn = useCallback(async (response) => {
    setGoogleLoading(true);
    setAuthError('');

    try {
      // Validate credential exists
      if (!response || !response.credential) {
        console.error('No credential received from Google');
        setAuthError('Google sign-in failed. No credential received. Please try again.');
        setGoogleLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.clear();
        trackEvent('google_signin', { email: data.user.email });
        navigate('/dashboard');
      } else {
        // More specific error messages
        if (data.error?.toLowerCase().includes('not found')) {
          setAuthError('No account found with this Google email. Please sign up first.');
        } else if (data.error?.toLowerCase().includes('token')) {
          setAuthError('Google verification failed. Please try again.');
        } else {
          setAuthError(data.error || 'Google sign in failed. Please try again.');
        }
        setGoogleLoading(false);
      }
    } catch (error) {
      console.error('Google sign-in network error:', error);
      setAuthError('Network error. Please check your connection and try again.');
      setGoogleLoading(false);
    }
  }, [navigate]);

  const handleGoogleButtonClick = useCallback(() => {
    setAuthError('');
    setGoogleLoading(false);

    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      setAuthError('Google Sign-In is loading. Please wait or use email sign-in.');
      return;
    }

    if (!googleInitialized.current) {
      // Re-initialize if needed
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: false,
        });
        googleInitialized.current = true;
      } catch (e) {
        console.error('Re-initialization failed:', e);
        setAuthError('Google Sign-In unavailable. Please use email sign-in.');
        return;
      }
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.log('Google prompt not displayed:', notification.getNotDisplayedReason());
        setAuthError('Google sign-in popup was blocked. Please allow popups or use email sign-in.');
      } else if (notification.isSkippedMoment()) {
        console.log('Google prompt skipped:', notification.getSkippedReason());
      }
    });
  }, [handleGoogleSignIn]);

  const handleGetStarted = () => {
    if (termsAccepted) {
      const token = localStorage.getItem('authToken');
      if (token) {
        sessionStorage.clear();
        navigate('/dashboard');
      } else {
        setShowAuth(true);
        setIsSignUp(true);
      }
    }
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    navigate('/terms');
  };

  const handlePrivacyClick = (e) => {
    e.preventDefault();
    navigate('/privacy');
  };

  const handleAuthChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setAuthError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.clear();
        trackEvent('signin', { email: formData.email });
        navigate('/dashboard');
      } else {
        setAuthError(data.error || 'Invalid email or password');
      }
    } catch (error) {
      setAuthError('Network error. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');

    if (formData.password !== formData.confirmPassword) {
      setAuthError('Passwords do not match');
      setIsAuthLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setAuthError('Password must be at least 8 characters');
      setIsAuthLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success && data.newUser) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.clear();
        trackEvent('signup', { email: formData.email });
        navigate('/dashboard');
      } else if (data.existingUser) {
        setAuthError('An account with this email already exists. Please sign in.');
        setIsSignUp(false);
      } else {
        setAuthError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setAuthError('Network error. Please try again.');
    }

    setIsAuthLoading(false);
  };

  const handleAuthSubmit = (e) => {
    if (isSignUp) {
      handleSignUp(e);
    } else {
      handleSignIn(e);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setAuthError('');
    setShowEmailForm(false);
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  // Close auth modal and reset all states
  const handleCloseAuth = () => {
    setShowAuth(false);
    setShowEmailForm(false);
    setAuthError('');
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  // Handle continue with email button
  const handleContinueWithEmail = () => {
    setShowEmailForm(true);
    setAuthError('');
  };

  // Handle back from email form
  const handleBackFromEmail = () => {
    setShowEmailForm(false);
    setAuthError('');
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  if (checkingAuth) return null;

  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <div className="app-container">
          <div className="welcome-content">
            <div className="rating-badge">
              <span className="stars">★★★★★</span>
              <span className="rating-text">Loved by students nationally 4.9</span>
            </div>

            <div className="divider-line"></div>

            <h1 className="main-heading">
              Your Journey To University, Simplified
            </h1>

            <div className="divider-line"></div>

            <div className="initial-view">
              <button 
                className={`get-started-btn ${termsAccepted ? 'active' : 'disabled'}`}
                onClick={handleGetStarted}
                disabled={!termsAccepted}
              >
                Get started
              </button>
              
              <div className="terms-container">
                <label className="terms-checkbox">
                  <input 
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span className="terms-text">
                    I agree to the{' '}
                    <a 
                      href="/terms" 
                      className="terms-link"
                      onClick={handleTermsClick}
                    >
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a 
                      href="/privacy" 
                      className="terms-link"
                      onClick={handlePrivacyClick}
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              <div className="signin-wrapper">
                <button 
                  className="signin-trigger"
                  onClick={() => { setShowAuth(true); setIsSignUp(false); }}
                >
                  Already have an account? Sign In
                </button>
              </div>

              <p className="app-footer">
                Start exploring universities and courses immediately
              </p>
            </div>

            {/* AUTH MODAL */}
            {showAuth && (
              <div className="auth-overlay" onClick={handleCloseAuth}>
                <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                  <button className="auth-modal-close" onClick={handleCloseAuth}>×</button>
                  
                  {!showEmailForm ? (
                    // Initial view - Google sign in only
                    <>
                      <h2 className="auth-modal-title">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                      </h2>
                      <p className="auth-modal-subtitle">
                        {isSignUp ? 'Choose how to create your account' : 'Choose how to sign in'}
                      </p>

                      {authError && (
                        <div className="auth-modal-error">{authError}</div>
                      )}

                      {/* Google Sign In Button */}
                      <button
                        type="button"
                        className="google-auth-btn"
                        onClick={handleGoogleButtonClick}
                        disabled={googleLoading}
                        style={{ marginBottom: '20px' }}
                      >
                        {googleLoading ? (
                          <>Please wait...</>
                        ) : (
                          <>
                            <svg width="20" height="20" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                          </>
                        )}
                      </button>

                      <div className="auth-modal-divider">
                        <span>or</span>
                      </div>

                      {/* Continue with Email Button */}
                      <button
                        type="button"
                        className="google-auth-btn"
                        onClick={handleContinueWithEmail}
                        style={{ 
                          background: 'white', 
                          color: '#333', 
                          border: '2px solid #e0e0e0',
                          marginBottom: '20px'
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        Continue with Email
                      </button>

                      <div className="auth-modal-toggle">
                        <button onClick={toggleAuthMode}>
                          {isSignUp
                            ? 'Already have an account? Sign In'
                            : "Don't have an account? Sign Up"}
                        </button>
                      </div>
                    </>
                  ) : (
                    // Email/Password Form View
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <button 
                          onClick={handleBackFromEmail}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            padding: '5px',
                            marginRight: '10px',
                            fontSize: '20px',
                            color: '#666'
                          }}
                        >
                          ←
                        </button>
                        <div>
                          <h2 className="auth-modal-title" style={{ margin: 0 }}>
                            {isSignUp ? 'Create Account with Email' : 'Sign In with Email'}
                          </h2>
                        </div>
                      </div>

                      {authError && (
                        <div className="auth-modal-error">{authError}</div>
                      )}

                      <form onSubmit={handleAuthSubmit} className="auth-modal-form">
                        <div className="auth-modal-group">
                          <label>Email Address</label>
                          <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleAuthChange}
                            required
                          />
                        </div>

                        <div className="auth-modal-group">
                          <label>Password</label>
                          <div className="auth-password-wrapper">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              placeholder="Your password"
                              value={formData.password}
                              onChange={handleAuthChange}
                              required
                            />
                            <button
                              type="button"
                              className="auth-password-toggle"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                  <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {isSignUp && (
                          <div className="auth-modal-group">
                            <label>Confirm Password</label>
                            <div className="auth-password-wrapper">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleAuthChange}
                                required
                              />
                              <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                  </svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        <button 
                          type="submit" 
                          className="auth-modal-submit"
                          disabled={isAuthLoading}
                        >
                          {isAuthLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                      </form>

                      {!isSignUp && (
                        <div className="auth-modal-forgot">
                          <button onClick={handleForgotPassword} type="button">
                            Forgot password?
                          </button>
                        </div>
                      )}

                      <div className="auth-modal-toggle">
                        <button onClick={toggleAuthMode}>
                          {isSignUp
                            ? 'Already have an account? Sign In'
                            : "Don't have an account? Sign Up"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />

      <Background />
    </div>
  );
}

function TermsAndConditions() {
  const navigate = useNavigate();

  const handlePrivacyClick = (e) => {
    e.preventDefault();
    navigate('/privacy');
  };

  return (
    <div className="app">
      <Header />
   
      <main className="app-main">
        <div className="app-container terms-page">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          
          <div className="terms-content">
            <h1 className="terms-title">Terms & Conditions</h1>
            <p className="terms-last-updated">Last Updated: July 2026</p>

            <div className="terms-section">
              <h2>1. Introduction</h2>
              <p>Welcome to Skolify ("we," "our," or "us"). These Terms and Conditions govern your use of the Skolify application and website (the "Platform"). By accessing or using Skolify, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use our Platform.</p>
            </div>

            <div className="terms-section">
              <h2>2. What is Skolify?</h2>
              <p>Skolify is an application platform designed to help students discover, research, and apply to universities and colleges in South Africa. Our mission is to simplify the application process and make higher education more accessible to students everywhere.</p>
              
              <div className="terms-important-box">
                <h3>Important Disclaimer:</h3>
                <p><strong>Skolify is NOT a university or educational institution.</strong> We are a technology platform that guides the application process. We do not:</p>
                <ul>
                  <li>Make admissions decisions</li>
                  <li>Influence or guarantee admission outcomes</li>
                  <li>Act as a representative of any educational institution</li>
                  <li>Provide academic credentials or degrees</li>
                </ul>
              </div>
            </div>

            <div className="terms-section">
              <h2>3. Our Role in the Application Process</h2>
              <p>Skolify acts as an intermediary platform that:</p>
              <ul>
                <li>Provides information about universities and their programs</li>
                <li>Guides the submission of applications to partner institutions</li>
                <li>Helps students organize and track their applications</li>
                <li>Offers guidance on application requirements and deadlines</li>
              </ul>
              <p><strong>Admissions decisions are made solely by the universities and colleges.</strong> Skolify has no authority over, and does not participate in, the admissions process. Each institution retains full control over its enrollment decisions based on its own criteria and standards.</p>
            </div>

            <div className="terms-section">
              <h2>4. No Guarantee of Admission</h2>
              <p>By using Skolify, you acknowledge and agree that:</p>
              <ul>
                <li>Submitting an application with the guidance of Skolify does not guarantee acceptance to any institution</li>
                <li>Admission decisions are the sole responsibility of the educational institutions</li>
                <li>Skolify does not evaluate applicant qualifications or predict admission likelihood</li>
                <li>Each university's admissions criteria, deadlines, and requirements may change without notice</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>5. User Responsibilities</h2>
              <p>As a user of Skolify, you agree to:</p>
              <ul>
                <li>Provide accurate, complete, and truthful information in all applications and communications</li>
                <li>Submit applications before the stated deadlines</li>
                <li>Pay any applicable fees as described in Section 6</li>
                <li>Review and understand each institution's specific requirements and policies</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Accept that you are solely responsible for the outcome of your applications</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>6. Payments, Fees, and Refunds</h2>
              
              <h3>6.1 R19 Results Unlock Service</h3>
              <p>Skolify offers a once-off R19 Results Unlock service that allows users to view all universities and courses they qualify for based on their academic results entered on the Platform.</p>
              <ul>
                <li>The R19 fee is a once-off payment for lifetime access to your personalized qualifying results on the Platform.</li>
                <li>Payment is processed securely via Yoco, a PCI-compliant payment gateway.</li>
                <li>Once payment is confirmed, your results are unlocked immediately and remain accessible whenever you log into your account.</li>
                <li><strong>Refund Policy for R19:</strong> The R19 Results Unlock fee is generally non-refundable. By paying R19, you acknowledge that the service provides immediate access to digital content (your qualifying universities and courses). Dissatisfaction with the results does not qualify for a refund. A refund may only be considered if a technical error on Skolify's part prevents you from accessing the results after payment. Refund requests must be submitted to skolifyteam@gmail.com within 48 hours of payment.</li>
              </ul>

              <h3>6.2 Application Service Fees (Per University / Term Sale)</h3>
              <p>Skolify charges a service fee for guiding and processing your university applications. The fee structure is as follows:</p>
              <ul>
                <li><strong>Per University:</strong> R59 per university application</li>
                <li><strong>3rd Term Sale:</strong> R249 for up to 4 universities</li>
              </ul>
              <p>These fees cover Skolify's application guidance and processing services only. They do NOT include the application fees charged by the universities themselves.</p>
              
              <h3>6.3 Refund Policy for Application Service Fees</h3>
              <ul>
                <li>If you request a refund <strong>before</strong> Skolify has begun processing your applications, you are entitled to a full refund of the service fee.</li>
                <li>If Skolify has <strong>already begun processing</strong> your applications (applications submitted to universities on your behalf), we will deduct the per-university fee (R59 per university already applied to) from your refund. You will be refunded the remaining balance for universities not yet processed.</li>
                <li><strong>Example:</strong> If you paid R249 for the Term Sale (4 universities) and we have already applied to 2 universities, your refund would be R249 - (2 × R59) = R131.</li>
                <li>Once an application has been fully processed and submitted to a university, that portion of the service fee is non-refundable as the service has been rendered.</li>
                <li>Refund requests must be submitted in writing to skolifyteam@gmail.com within 14 days of payment.</li>
                <li>Processing of refunds may take 7-14 business days.</li>
              </ul>

              <h3>6.4 Institution Application Fees</h3>
              <p>Some universities charge their own application fees. These fees are:</p>
              <ul>
                <li>Set by and payable to the respective educational institutions</li>
                <li>Not included in Skolify's service fees</li>
                <li>Subject to the refund policies of the respective institutions</li>
                <li>Clearly indicated on the Platform where applicable</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>7. Accuracy of Information</h2>
              <p>While we strive to keep all university and program information accurate and up-to-date:</p>
              <ul>
                <li>We cannot guarantee that all information is complete, current, or error-free</li>
                <li>University requirements, deadlines, and offerings may change</li>
                <li>Users should verify critical information directly with institutions</li>
                <li>Skolify is not liable for inaccuracies in third-party information</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>8. Privacy and Data Protection (POPIA Compliance)</h2>
              <p>Your privacy is important to us. We comply with the Protection of Personal Information Act (POPIA) of South Africa. By using Skolify, you consent to:</p>
              <ul>
                <li>The collection and processing of your personal information as described in our Privacy Policy</li>
                <li>The sharing of your application information with the institutions you apply to</li>
                <li>The use of cookies and similar technologies to enhance your experience</li>
                <li>Your right to access, correct, or delete your personal information</li>
              </ul>
              <p>For full details, please review our <a href="/privacy" onClick={handlePrivacyClick}>Privacy Policy</a>.</p>
            </div>

            <div className="terms-section">
              <h2>9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, Skolify and its affiliates, officers, employees, and agents shall not be liable for:</p>
              <ul>
                <li>Any admission decisions made by educational institutions</li>
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of opportunities, data, or profits</li>
                <li>Any errors or omissions in content</li>
                <li>Any unauthorized access to or use of our servers and/or personal information</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>10. Intellectual Property</h2>
              <p>All content on the Skolify platform, including but not limited to logos, text, graphics, software, and the "Skolify" name, is our property or licensed to us and is protected by intellectual property laws. You may not use our intellectual property without our express written consent.</p>
            </div>

            <div className="terms-section">
              <h2>11. Third-Party Links and Services</h2>
              <p>Skolify may contain links to third-party websites or services (including university portals). We do not control and are not responsible for:</p>
              <ul>
                <li>The content or practices of any third-party websites</li>
                <li>Any transactions between you and third parties</li>
                <li>The privacy practices of third parties</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>12. Modifications to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Platform. Your continued use of Skolify after changes constitutes acceptance of the modified Terms. We will make reasonable efforts to notify users of material changes.</p>
            </div>

            <div className="terms-section">
              <h2>13. Termination</h2>
              <p>We reserve the right to suspend or terminate your access to Skolify at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, third parties, or our business interests.</p>
            </div>

            <div className="terms-section">
              <h2>14. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts of South Africa.</p>
            </div>

            <div className="terms-section">
              <h2>15. Contact Information</h2>
              <p>If you have any questions about these Terms, please contact us at:</p>
              <p className="contact-info">
                Email: skolifyteam@gmail.com<br />
                Address: Pretoria, South Africa
              </p>
            </div>

            <div className="terms-footer">
              <button className="submit-btn" onClick={() => navigate('/')}>
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </main>

      <Background />
    </div>
  );
}

function PrivacyPolicy() {
  const navigate = useNavigate();

  const handleTermsClick = (e) => {
    e.preventDefault();
    navigate('/terms');
  };

  return (
    <div className="app">
      <Header />
      
      <main className="app-main">
        <div className="app-container terms-page">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          
          <div className="terms-content">
            <h1 className="terms-title">Privacy Policy</h1>
            <p className="terms-last-updated">Last Updated: July 2026</p>
            <p className="popia-notice">Compliant with the Protection of Personal Information Act (POPIA) of South Africa</p>

            <div className="terms-section">
              <h2>1. Introduction</h2>
              <p>Skolify ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our Platform. We comply with the Protection of Personal Information Act (POPIA) of South Africa.</p>
            </div>

            <div className="terms-section">
              <h2>2. Information We Collect</h2>
              <p>We may collect the following types of personal information:</p>
              <ul>
                <li><strong>Personal Identifiers:</strong> Name, surname, ID number, date of birth, gender, nationality</li>
                <li><strong>Contact Information:</strong> Email address, phone number, WhatsApp number, physical address</li>
                <li><strong>Academic Information:</strong> Subjects, marks, APS scores, educational history</li>
                <li><strong>Application Information:</strong> Courses selected, universities chosen, application status</li>
                <li><strong>Payment Information:</strong> Transaction details (payment information is processed by secure third-party payment gateways including Yoco)</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, usage data</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>3. How We Collect Information</h2>
              <p>We collect information in the following ways:</p>
              <ul>
                <li><strong>Directly from you:</strong> When you register, complete forms, upload documents, or communicate with us</li>
                <li><strong>Automatically:</strong> Through cookies and similar technologies when you use our Platform</li>
                <li><strong>From third parties:</strong> When you authorize us to receive information from educational institutions or other services</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>4. How We Use Your Information</h2>
              <p>We use your personal information for the following purposes:</p>
              <ul>
                <li>To create and manage your account</li>
                <li>To guide your university applications</li>
                <li>To provide course recommendations based on your academic profile</li>
                <li>To communicate with you about your applications and our services</li>
                <li>To process payments and provide receipts</li>
                <li>To improve and personalize your experience</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>5. Sharing Your Information</h2>
              <p>We may share your information with:</p>
              <ul>
                <li><strong>Educational Institutions:</strong> To submit your applications and facilitate the admissions process</li>
                <li><strong>Service Providers:</strong> Third parties who assist us with payment processing (Yoco), hosting, analytics, and customer support</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>
            </div>

            <div className="terms-section">
              <h2>6. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, loss, or damage. This includes:</p>
              <ul>
                <li>Encryption of sensitive data</li>
                <li>Secure servers and firewalls</li>
                <li>Access controls and authentication</li>
                <li>Regular security assessments</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>7. Data Retention</h2>
              <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. You may request deletion of your account and associated data at any time.</p>
            </div>

            <div className="terms-section">
              <h2>8. Your Rights (POPIA)</h2>
              <p>Under POPIA, you have the following rights:</p>
              <ul>
                <li><strong>Right to Access:</strong> You may request a copy of the personal information we hold about you</li>
                <li><strong>Right to Correction:</strong> You may request correction of inaccurate or incomplete information</li>
                <li><strong>Right to Deletion:</strong> You may request deletion of your personal information, subject to legal obligations</li>
                <li><strong>Right to Object:</strong> You may object to the processing of your personal information</li>
                <li><strong>Right to Withdraw Consent:</strong> You may withdraw consent for processing where consent was the basis</li>
              </ul>
              <p>To exercise these rights, please contact us at skolifyteam@gmail.com.</p>
            </div>

            <div className="terms-section">
              <h2>9. Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. You can manage your cookie preferences through your browser settings.</p>
            </div>

            <div className="terms-section">
              <h2>10. Children's Privacy</h2>
              <p>Skolify is intended for students applying to universities. Users under 18 years of age should have parental consent before using our Platform.</p>
            </div>

            <div className="terms-section">
              <h2>11. International Data Transfers</h2>
              <p>Your information may be transferred to and processed in countries outside South Africa. We ensure appropriate safeguards are in place for such transfers.</p>
            </div>

            <div className="terms-section">
              <h2>12. Changes to This Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our Platform and updating the "Last Updated" date.</p>
            </div>

            <div className="terms-section">
              <h2>13. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:</p>
              <p className="contact-info">
                Email: skolifyteam@gmail.com<br />
                Address: Pretoria, South Africa
              </p>
            </div>

            <div className="terms-footer">
              <button className="submit-btn" onClick={() => navigate('/')}>
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </main>

      <Background />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/apply" element={<ExpressApply />} />
        <Route path="/june" element={<JuneSpecial />} />
        <Route path="/freemium-friday" element={<FreemiumFriday />} />
        <Route path="/quick-apply" element={<QuickApply />} />
        <Route path="/accommodation" element={<Accommodation />} />
        <Route path="/bursary" element={<Bursary />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/payment/error" element={<PaymentError />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;