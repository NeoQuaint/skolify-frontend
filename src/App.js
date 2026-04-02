import API_URL from './config';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Background from './Background';
import Dashboard from './Dashboard';
import PaymentPage from './PaymentPage';
import ProfilePage from './ProfilePage';
import Accommodation from './Accommodation';
import Bursary from './Bursary';
import PaymentSuccess from './Pages/PaymentSuccess';
import PaymentCancel from './Pages/PaymentCancel';
import PaymentError from './Pages/PaymentError';

function WelcomeScreen() {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [signInData, setSignInData] = useState({
    username: '',
    password: ''
  });
  const [signInError, setSignInError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const handleGetStarted = () => {
    if (termsAccepted) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/dashboard');
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

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData(prev => ({ ...prev, [name]: value }));
    setSignInError('');
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    setSignInError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signInData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        sessionStorage.removeItem('dashboard_subjects');
        sessionStorage.removeItem('dashboard_userAPS');
        sessionStorage.removeItem('dashboard_selectedFaculties');
        sessionStorage.removeItem('dashboard_selectedCourses');
        sessionStorage.removeItem('dashboard_eligibleCourses');
        sessionStorage.removeItem('dashboard_eligibleFaculties');
        sessionStorage.removeItem('dashboard_showFaculties');
        
        navigate('/dashboard');
      } else {
        setSignInError('Invalid username or password');
      }
    } catch (error) {
      setSignInError('Network error. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const toggleSignIn = () => {
    setShowSignIn(!showSignIn);
    setSignInError('');
    setSignInData({ username: '', password: '' });
    setShowForgotPassword(false);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
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
        </div>
      </header>

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

            {!showSignIn ? (
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
                    onClick={toggleSignIn}
                  >
                    Already have an account? Sign In
                  </button>
                </div>

                <p className="app-footer">
                  Start exploring universities and courses immediately
                </p>
              </div>
            ) : (
              <div className="signin-view">
                <h2 className="signin-title">Welcome Back</h2>
                <p className="signin-subtitle">Sign in with your credentials</p>

                {signInError && (
                  <div className="signin-error">{signInError}</div>
                )}

                <form onSubmit={handleSignInSubmit} className="signin-form">
                  <div className="signin-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="John.Doe"
                      value={signInData.username}
                      onChange={handleSignInChange}
                      required
                    />
                    <small>Format: FirstName.LastName</small>
                  </div>

                  <div className="signin-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Your password"
                      value={signInData.password}
                      onChange={handleSignInChange}
                      required
                    />
                    <small>Use the password you created</small>
                  </div>

                  <button 
                    type="submit" 
                    className="signin-submit-btn"
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <div className="forgot-password-wrapper">
                  <button 
                    className="forgot-password-btn"
                    onClick={handleForgotPassword}
                    type="button"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="signin-wrapper" style={{ marginTop: '20px' }}>
                  <button 
                    className="signin-trigger"
                    onClick={toggleSignIn}
                  >
                    ← Back to Get Started
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="forgot-password-modal">
          <div className="forgot-password-overlay" onClick={closeForgotPassword}></div>
          <div className="forgot-password-content">
            <div className="forgot-password-header">
              <h3>Reset Your Password</h3>
              <button 
                className="close-forgot-password"
                onClick={closeForgotPassword}
              >
                ×
              </button>
            </div>
            <div className="forgot-password-body">
              <p>Please contact our support team to reset your password:</p>
              <p className="support-email">
                <a href="mailto:skolifyteam@gmail.com">skolifyteam@gmail.com</a>
              </p>
              <p className="support-note">Include your username and ID number in the email.</p>
            </div>
            <div className="forgot-password-footer">
              <button 
                className="close-modal-btn"
                onClick={closeForgotPassword}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
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
        </div>
      </header>

      <main className="app-main">
        <div className="app-container terms-page">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          
          <div className="terms-content">
            <h1 className="terms-title">Terms & Conditions</h1>
            <p className="terms-last-updated">Last Updated: February 2026</p>

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
                <li>Pay any applicable application fees directly to institutions or through our platform as specified</li>
                <li>Review and understand each institution's specific requirements and policies</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Accept that you are solely responsible for the outcome of your applications</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>6. Application Fees, Payments, and Refunds</h2>
              <p>Some institutions may charge application fees. Regarding such fees:</p>
              <ul>
                <li>Application fees are set by and paid to the educational institutions</li>
                <li>Skolify charges a separate service fee for platform usage, which will be clearly disclosed</li>
                <li><strong>Refund Policy:</strong> All fees paid to Skolify are non-refundable once an application has been submitted, unless:</li>
                <ul>
                  <li>The application was not successfully transmitted to the institution due to a technical error on Skolify's part</li>
                  <li>Duplicate payment was processed in error</li>
                  <li>Required by South African consumer protection law (CPA)</li>
                </ul>
                <li>Refund requests must be submitted in writing to skolifyteam@gmail.com within 14 days of payment</li>
                <li>Processing refunds may take 7-14 business days</li>
                <li>Institution application fees are subject to the refund policies of the respective institutions</li>
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
                Support: skolifyteam@gmail.com<br />
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
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
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
        </div>
      </header>

      <main className="app-main">
        <div className="app-container terms-page">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          
          <div className="terms-content">
            <h1 className="terms-title">Privacy Policy</h1>
            <p className="terms-last-updated">Last Updated: February 2026</p>
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
                <li><strong>Payment Information:</strong> Transaction details (payment information is processed by secure third-party payment gateways)</li>
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
                <li><strong>Service Providers:</strong> Third parties who assist us with payment processing, hosting, analytics, and customer support</li>
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
              <p>To exercise these rights, please contact us at privacy@skolify.com.</p>
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
                
                Support: skolifyteam@gmail.com<br />
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/accommodation" element={<Accommodation />} />
        <Route path="/bursary" element={<Bursary />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<Dashboard />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/payment/error" element={<PaymentError />} />
      </Routes>
    </Router>
  );
}

export default App;