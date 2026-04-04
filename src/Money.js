import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Money.css';
import { 
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaGraduationCap, FaCreditCard, 
  FaTimes, FaCheck, FaUpload, FaHome, FaUserTie, FaPhoneAlt, FaWhatsapp, 
  FaChevronDown, FaChevronUp, FaInfoCircle, FaUniversity, FaSpinner, FaLock, FaEye, FaEyeSlash
} from 'react-icons/fa';
import API_URL from './config';

const Money = ({ isOpen, onClose, totalAmount, onPaymentComplete }) => {
  const navigate = useNavigate();
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  
  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  });

  const [loggedInUser, setLoggedInUser] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });

  // Get tracking number from sessionStorage
  const [paymentTrackingNumber, setPaymentTrackingNumber] = useState(() => {
    const tracking = sessionStorage.getItem('paymentTrackingNumber');
    return tracking || null;
  });

  // Clear sessionStorage after reading
  useEffect(() => {
    if (paymentTrackingNumber) {
      sessionStorage.removeItem('paymentTrackingNumber');
    }
  }, [paymentTrackingNumber]);

  // State for toggling all sections
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ id: '', results: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [backendTrackingNumber, setBackendTrackingNumber] = useState(null);
  
  // Card payment fields
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvc: ''
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    homeLanguage: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    address: '',
    suburb: '',
    city: '',
    province: '',
    postalCode: '',
    kinName: '',
    kinRelationship: '',
    kinPhone: '',
    kinEmail: '',
    password: '',
    confirmPassword: '',
  });
  
  const [documents, setDocuments] = useState({
    id: { name: null, uploaded: false, file: null },
    results: { name: null, uploaded: false, file: null }
  });

  // Real-time password match check
  useEffect(() => {
    if (formData.confirmPassword !== '') {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [formData.password, formData.confirmPassword]);

  // Fetch user profile from database when logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isLoggedIn) {
        setIsLoadingProfile(true);
        const token = localStorage.getItem('authToken');
        
        try {
          const response = await fetch(`${API_URL}/api/user/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          
          if (data.success) {
            setFormData(prev => ({
              ...prev,
              firstName: data.user.first_name || '',
              lastName: data.user.last_name || '',
              email: data.user.email || '',
              idNumber: data.user.id_number || '',
              gender: data.user.gender || '',
              phoneNumber: data.user.phone_number || '',
              whatsappNumber: data.user.whatsapp_number || '',
              province: data.user.province || '',
              city: data.user.city || '',
              homeLanguage: data.user.home_language || '',
              nationality: data.user.nationality || '',
              kinName: data.user.kin_name || '',
              kinPhone: data.user.kin_phone || '',
              dateOfBirth: data.user.date_of_birth || '',
              address: data.user.address || '',
              suburb: data.user.suburb || '',
              postalCode: data.user.postal_code || '',
              kinRelationship: data.user.kin_relationship || '',
              kinEmail: data.user.kin_email || ''
            }));
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };
    
    fetchUserProfile();
  }, [isLoggedIn]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      if (cleaned.length <= 16) {
        const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
        setCardDetails(prev => ({ ...prev, [name]: formatted }));
      }
    } 
    else if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 4) {
        let formatted = cleaned;
        if (cleaned.length > 2) {
          formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        setCardDetails(prev => ({ ...prev, [name]: formatted }));
      }
    }
    else if (name === 'cvc') {
      if (value.length <= 4) {
        setCardDetails(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
      }
    }
    else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (type, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setError('');
    setFieldErrors(prev => ({ ...prev, [type]: '' }));
    
    const formDataFile = new FormData();
    formDataFile.append(type, file);
    
    try {
      const response = await fetch(`${API_URL}/api/upload-documents`, {
        method: 'POST',
        body: formDataFile
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        const errorMsg = result.error || 'Upload failed';
        setFieldErrors(prev => ({ ...prev, [type]: errorMsg }));
        throw new Error(errorMsg);
      }
      
      if (result.success) {
        setDocuments({
          ...documents,
          [type]: { 
            name: file.name, 
            uploaded: true, 
            file: file
          }
        });
        setFieldErrors(prev => ({ ...prev, [type]: '' }));
      } else {
        const errorMsg = result.error || 'Upload failed';
        setFieldErrors(prev => ({ ...prev, [type]: errorMsg }));
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Upload error:', error);
      e.target.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    // For EFT, we don't need card validation
    if (paymentMethod === 'eft') {
      if (isLoggedIn) return true;
      
      if (!formData.firstName || formData.firstName.trim().length < 2) {
        setError('Please enter your first name');
        return false;
      }
      if (!formData.lastName || formData.lastName.trim().length < 2) {
        setError('Please enter your last name');
        return false;
      }
      if (!formData.idNumber || formData.idNumber.trim().length < 6) {
        setError('Please enter a valid ID/Passport number');
        return false;
      }
      if (!isLoggedIn) {
        if (!formData.password || formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
      }
      if (!formData.email || !formData.email.includes('@')) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.phoneNumber || formData.phoneNumber.trim().length < 10) {
        setError('Please enter a valid phone number');
        return false;
      }
      if (!documents.id.uploaded) {
        setFieldErrors(prev => ({ ...prev, id: 'Please upload your ID document' }));
        return false;
      }
      if (!documents.results.uploaded) {
        setFieldErrors(prev => ({ ...prev, results: 'Please upload your Matric/Grade 11 results' }));
        return false;
      }
      return true;
    }

    // For Card - validate card details
    if (paymentMethod === 'card') {
      if (isLoggedIn) return true;
      
      if (!formData.firstName || formData.firstName.trim().length < 2) {
        setError('Please enter your first name');
        return false;
      }
      if (!formData.lastName || formData.lastName.trim().length < 2) {
        setError('Please enter your last name');
        return false;
      }
      if (!formData.idNumber || formData.idNumber.trim().length < 6) {
        setError('Please enter a valid ID/Passport number');
        return false;
      }
      if (!isLoggedIn) {
        if (!formData.password || formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
      }
      if (!formData.email || !formData.email.includes('@')) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.phoneNumber || formData.phoneNumber.trim().length < 10) {
        setError('Please enter a valid phone number');
        return false;
      }
      if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid card number');
        return false;
      }
      if (!cardDetails.cardName || cardDetails.cardName.trim().length < 3) {
        setError('Please enter the name on card');
        return false;
      }
      if (!cardDetails.expiryDate || cardDetails.expiryDate.length < 5) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
        setError('Please enter a valid CVC code');
        return false;
      }
      if (!documents.id.uploaded) {
        setFieldErrors(prev => ({ ...prev, id: 'Please upload your ID document' }));
        return false;
      }
      if (!documents.results.uploaded) {
        setFieldErrors(prev => ({ ...prev, results: 'Please upload your Matric/Grade 11 results' }));
        return false;
      }
      return true;
    }

    return true;
  };

  const saveApplicationToDatabase = async (trackingNumber, filePaths) => {
    const token = localStorage.getItem('authToken');
    
    const applicationData = {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      idNumber: formData.idNumber,
      dateOfBirth: formData.dateOfBirth || null,
      gender: formData.gender,
      nationality: formData.nationality,
      homeLanguage: formData.homeLanguage,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      whatsappNumber: formData.whatsappNumber,
      address: formData.address,
      suburb: formData.suburb,
      city: formData.city,
      province: formData.province,
      postalCode: formData.postalCode,
      kinName: formData.kinName,
      kinRelationship: formData.kinRelationship,
      kinPhone: formData.kinPhone,
      kinEmail: formData.kinEmail,
      documents: filePaths,
      trackingNumber: trackingNumber
    };

    try {
      const response = await fetch(`${API_URL}/api/applications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(applicationData)
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Generate tracking number
      const trackingNumber = `SKL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Save application to database
      const filePaths = {
        id: documents.id.file ? documents.id.file.name : null,
        results: documents.results.file ? documents.results.file.name : null
      };
      
      await saveApplicationToDatabase(trackingNumber, filePaths);
      
      // Store tracking number
      localStorage.setItem('paymentTrackingNumber', trackingNumber);
      
      // Simulate card payment processing
      setTimeout(() => {
        setIsProcessing(false);
        // Navigate to success page
        navigate('/payment/success', { 
          state: { 
            trackingNumber: trackingNumber,
            amount: totalAmount,
            paymentMethod: 'card'
          } 
        });
        if (onPaymentComplete) onPaymentComplete();
        onClose();
      }, 2000);
      
    } catch (error) {
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleEFTPayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Generate tracking number
      const trackingNumber = `SKL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Save application to database
      const filePaths = {
        id: documents.id.file ? documents.id.file.name : null,
        results: documents.results.file ? documents.results.file.name : null
      };
      
      await saveApplicationToDatabase(trackingNumber, filePaths);
      
      // Store tracking number
      localStorage.setItem('paymentTrackingNumber', trackingNumber);
      
      // Show EFT details
      setError('');
      alert(`EFT Payment Instructions:\n\nBank: Skolify Banking\nAccount Name: Skolify (Pty) Ltd\nAccount Number: 1234567890\nBranch Code: 123456\nReference: ${trackingNumber}\n\nAmount: R${totalAmount}\n\nUse the reference number when making payment.`);
      
      setIsProcessing(false);
      
    } catch (error) {
      setError('Failed to process. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="money-overlay">
      <div className="money-container narrow" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="money-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="money-header">
          <h2>Complete Your Payment</h2>
          <p>
            {isLoggedIn 
              ? 'Your information is already saved. Complete your payment below.' 
              : 'Please provide all details for your university applications'}
          </p>
        </div>

        {/* Welcome Back Banner for Logged-in Users */}
        {isLoggedIn && loggedInUser && (
          <div className="welcome-back-banner">
            <FaUser className="welcome-icon" />
            <div className="welcome-text">
              <span className="welcome-greeting">Welcome back, {loggedInUser.firstName}!</span>
              <span className="welcome-message">Your details are already saved. Complete your payment below.</span>
            </div>
          </div>
        )}

        {isLoadingProfile && (
          <div className="loading-profile">
            <p>Loading your profile...</p>
          </div>
        )}

        {error && (
          <div className="money-error">
            {error}
          </div>
        )}

        <form onSubmit={paymentMethod === 'card' ? handleCardPayment : handleEFTPayment} className="money-form">
          {isLoggedIn ? (
            <>
              {/* For logged-in users: Show summary of their info */}
              <div className="saved-info-summary">
                <div className="summary-header">
                  <FaCheck className="summary-check-icon" />
                  <h3>Your information is saved</h3>
                </div>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Name:</span>
                    <span className="summary-value">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Email:</span>
                    <span className="summary-value">{formData.email}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Phone:</span>
                    <span className="summary-value">{formData.phoneNumber}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">ID:</span>
                    <span className="summary-value">••••{formData.idNumber?.slice(-4)}</span>
                  </div>
                </div>
                <p className="summary-note">
                  <FaInfoCircle /> Your personal details are already in our system. 
                  You can update them later in your profile.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Personal Information Section */}
              <div className="money-section-card">
                <div className="section-title">
                  <span className="section-number">1</span>
                  <h3>Personal Information</h3>
                </div>
                
                <div className="money-row">
                  <div className="money-group">
                    <label><FaUser /> First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="money-group">
                    <label>Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      placeholder="Michael (optional)"
                      value={formData.middleName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="money-group">
                  <label><FaUser /> Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="money-group">
                  <label><FaIdCard /> ID / Passport Number *</label>
                  <input
                    type="text"
                    name="idNumber"
                    placeholder="000101 5084 089"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    required
                  />
                  <small className="field-note">This will be used for verification</small>
                </div>

                {/* Password Fields with Toggle Visibility */}
                <div className="money-row">
                  <div className="money-group">
                    <label><FaLock /> Create Password *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <small className="field-note">Password must be at least 8 characters</small>
                  </div>

                  <div className="money-group">
                    <label><FaLock /> Confirm Password *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        style={{
                          borderColor: !passwordMatch && formData.confirmPassword !== '' ? '#dc3545' : ''
                        }}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {!passwordMatch && formData.confirmPassword !== '' && (
                      <small className="password-error-message" style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                        Passwords do not match
                      </small>
                    )}
                    {passwordMatch && formData.password && formData.confirmPassword && formData.confirmPassword !== '' && (
                      <small className="password-success-message" style={{ color: '#28a745', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                        ✓ Passwords match
                      </small>
                    )}
                  </div>
                </div>

                <div className="money-row">
                  <div className="money-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="money-group">
                    <label>Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="money-select"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="money-row">
                  <div className="money-group">
                    <label>Nationality *</label>
                    <input
                      type="text"
                      name="nationality"
                      placeholder="South African"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="money-group">
                    <label>Home Language</label>
                    <input
                      type="text"
                      name="homeLanguage"
                      placeholder="English / IsiZulu etc."
                      value={formData.homeLanguage}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="money-section-card">
                <div className="section-title">
                  <span className="section-number">2</span>
                  <h3>Contact Information</h3>
                </div>
                
                <div className="money-group">
                  <label><FaEnvelope /> Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <small className="field-note">We'll send application updates here</small>
                </div>

                <div className="money-row">
                  <div className="money-group">
                    <label><FaPhone /> Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="+27 11 123 4567"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="money-group">
                    <label><FaWhatsapp /> WhatsApp Number *</label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      placeholder="+27 11 123 4567"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="money-section-card">
                <div className="section-title">
                  <span className="section-number">3</span>
                  <h3>Residential Address</h3>
                </div>
                
                <div className="money-group">
                  <label><FaHome /> Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="money-group">
                  <label>Suburb</label>
                  <input
                    type="text"
                    name="suburb"
                    placeholder="Sandton"
                    value={formData.suburb}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="money-row">
                  <div className="money-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Johannesburg"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="money-group">
                    <label>Province *</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                      className="money-select"
                    >
                      <option value="">Select Province</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="Western Cape">Western Cape</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Free State">Free State</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="North West">North West</option>
                      <option value="Northern Cape">Northern Cape</option>
                    </select>
                  </div>
                </div>

                <div className="money-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="2000"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Next of Kin Section */}
              <div className="money-section-card">
                <div className="section-title">
                  <span className="section-number">4</span>
                  <h3>Next of Kin / Emergency Contact</h3>
                </div>
                
                <div className="money-group">
                  <label><FaUserTie /> Full Name *</label>
                  <input
                    type="text"
                    name="kinName"
                    placeholder="Jane Doe"
                    value={formData.kinName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="money-group">
                  <label>Relationship *</label>
                  <input
                    type="text"
                    name="kinRelationship"
                    placeholder="Mother / Father / Guardian / Spouse"
                    value={formData.kinRelationship}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="money-row">
                  <div className="money-group">
                    <label><FaPhoneAlt /> Phone Number *</label>
                    <input
                      type="tel"
                      name="kinPhone"
                      placeholder="+27 11 123 4567"
                      value={formData.kinPhone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="money-group">
                    <label><FaEnvelope /> Email</label>
                    <input
                      type="email"
                      name="kinEmail"
                      placeholder="jane.doe@example.com (optional)"
                      value={formData.kinEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="money-section-card">
                <div className="section-title">
                  <span className="section-number">5</span>
                  <h3>Required Documents</h3>
                  <small className="section-hint">Max 5MB per file. PDF or images only.</small>
                </div>
                
                <div className="document-upload-item">
                  <div className="document-info">
                    <FaIdCard className="document-icon" />
                    <div>
                      <span className="document-name">ID Document / Passport</span>
                      <small className="document-hint">Certified copy (PDF or Image)</small>
                    </div>
                  </div>
                  <div className="document-actions">
                    {!documents.id.uploaded ? (
                      <label className={`upload-btn ${isUploading ? 'disabled' : ''}`}>
                        <FaUpload />
                        <input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('id', e)}
                          disabled={isUploading}
                          hidden
                        />
                      </label>
                    ) : (
                      <div className="uploaded-file">
                        <FaCheck className="uploaded-icon" />
                        <span>{documents.id.name}</span>
                        <button 
                          type="button"
                          className="change-file-btn"
                          onClick={() => setDocuments({...documents, id: { name: null, uploaded: false, file: null }})}
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                  {fieldErrors.id && (
                    <div className="field-error">
                      {fieldErrors.id}
                    </div>
                  )}
                </div>

                <div className="document-upload-item">
                  <div className="document-info">
                    <FaGraduationCap className="document-icon" />
                    <div>
                      <span className="document-name">Matric / Grade 11 Results</span>
                      <small className="document-hint">Latest academic results</small>
                    </div>
                  </div>
                  <div className="document-actions">
                    {!documents.results.uploaded ? (
                      <label className={`upload-btn ${isUploading ? 'disabled' : ''}`}>
                        <FaUpload />
                        <input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('results', e)}
                          disabled={isUploading}
                          hidden
                        />
                      </label>
                    ) : (
                      <div className="uploaded-file">
                        <FaCheck className="uploaded-icon" />
                        <span>{documents.results.name}</span>
                        <button 
                          type="button"
                          className="change-file-btn"
                          onClick={() => setDocuments({...documents, results: { name: null, uploaded: false, file: null }})}
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                  {fieldErrors.results && (
                    <div className="field-error">
                      {fieldErrors.results}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Payment Method Selection */}
          <div className="payment-method-section">
            <h3>Select Payment Method</h3>
            <div className="payment-methods">
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <FaCreditCard /> Card
              </button>
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'eft' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('eft')}
              >
                <FaUniversity /> EFT
              </button>
            </div>
          </div>

          {/* Card Payment Fields - Shows when Card is selected */}
          {paymentMethod === 'card' && (
            <div className="card-payment-section">
              <div className="money-group">
                <label><FaCreditCard /> Card Number *</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardInputChange}
                  maxLength="19"
                  required
                />
              </div>

              <div className="money-group">
                <label>Name on Card *</label>
                <input
                  type="text"
                  name="cardName"
                  placeholder="JOHN DOE"
                  value={cardDetails.cardName}
                  onChange={handleCardInputChange}
                  required
                />
              </div>

              <div className="money-row">
                <div className="money-group">
                  <label>Expiry Date *</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleCardInputChange}
                    maxLength="5"
                    required
                  />
                </div>

                <div className="money-group">
                  <label>CVC *</label>
                  <input
                    type="text"
                    name="cvc"
                    placeholder="123"
                    value={cardDetails.cvc}
                    onChange={handleCardInputChange}
                    maxLength="4"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* EFT Payment Instructions - Shows when EFT is selected */}
          {paymentMethod === 'eft' && (
            <div className="eft-payment-section">
              <div className="eft-instructions">
                <FaUniversity className="eft-icon" />
                <h4>EFT Bank Transfer</h4>
                <p>Please use the following bank details to make your payment:</p>
                <div className="bank-details">
                  <p><strong>Bank:</strong> Skolify Banking</p>
                  <p><strong>Account Name:</strong> Skolify (Pty) Ltd</p>
                  <p><strong>Account Number:</strong> 1234567890</p>
                  <p><strong>Branch Code:</strong> 123456</p>
                  <p><strong>Reference:</strong> Will be generated after submission</p>
                  <p><strong>Amount:</strong> R{totalAmount}</p>
                </div>
                <p className="eft-note">
                  After completing the payment, your application will be processed within 24-48 hours.
                </p>
              </div>
            </div>
          )}

          <div className="money-summary">
            <div className="summary-left">
              <span>Total Amount:</span>
              <span className="total-amount">R{totalAmount}</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="pay-now-btn"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <FaSpinner className="spinner-icon" /> Processing...
              </>
            ) : (
              `Pay R${totalAmount}`
            )}
          </button>

          <p className="secure-payment">
            🔒 All information is encrypted and secure
          </p>
        </form>
      </div>
    </div>
  );
};

export default Money;