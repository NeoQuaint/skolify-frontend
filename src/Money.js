import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Money.css';
import { 
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaGraduationCap, 
  FaTimes, FaCheck, FaUpload, FaHome, FaUserTie, FaPhoneAlt, FaWhatsapp, 
  FaInfoCircle, FaSpinner, FaUniversity, FaCreditCard, FaCopy, FaBank
} from 'react-icons/fa';
import API_URL from './config';

const Money = ({ isOpen, onClose, totalAmount, selectedPackage, onPaymentComplete }) => {
  const navigate = useNavigate();
  
  const [hasCompletedPaymentBefore, setHasCompletedPaymentBefore] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ id: '', results: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [pendingTransactionData, setPendingTransactionData] = useState(null);
  
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
  });
  
  const [documents, setDocuments] = useState({
    id: { name: null, uploaded: false, file: null, path: null },
    results: { name: null, uploaded: false, file: null, path: null }
  });

  const packageLinks = {
    basic: 'https://pay.yoco.com/k2026084461-south-africa?amount=169.00&reference=BasicPackage',
    standard: 'https://pay.yoco.com/k2026084461-south-africa?amount=329.00&reference=StandardPackage',
    premium: 'https://pay.yoco.com/k2026084461-south-africa?amount=499.00&reference=PremiumPackage'
  };

  // Bank account details
  const bankDetails = {
    accountNumber: '63199178419',
    accountName: 'K2026084461 (South Africa) (pty) Ltd',
    bankName: 'First National Bank (FNB)',
    accountType: 'Business Cheque Account',
    branchCode: '250655',
    reference: 'ID Number'
  };

  useEffect(() => {
    const checkPaymentHistory = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsLoadingCheck(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/api/user/completed-payments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.hasCompletedPayments === true) {
          setHasCompletedPaymentBefore(true);
          await fetchUserProfile(true);
        } else {
          setHasCompletedPaymentBefore(false);
        }
      } catch (error) {
        console.error('Error checking payment history:', error);
        setHasCompletedPaymentBefore(false);
      } finally {
        setIsLoadingCheck(false);
      }
    };
    
    const fetchUserProfile = async (shouldLoad) => {
      if (!shouldLoad) return;
      
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      setIsLoadingProfile(true);
      
      try {
        const response = await fetch(`${API_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
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
    };
    
    if (isOpen) {
      checkPaymentHistory();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({ ...prev, [name]: value }));
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
        const s3Path = result.paths[type];
        console.log(`✅ File uploaded to S3: ${s3Path}`);
        
        setDocuments({
          ...documents,
          [type]: { 
            name: file.name, 
            uploaded: true, 
            file: file,
            path: s3Path
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
    if (hasCompletedPaymentBefore) {
      return true;
    }
    
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
  };

  const saveApplicationData = async (transactionId, paymentMethod = 'bank_transfer') => {
    const token = localStorage.getItem('authToken');
    const pendingSummary = sessionStorage.getItem('pendingApplicationSummary');
    let applicationData = {};
    
    if (pendingSummary) {
      const summary = JSON.parse(pendingSummary);
      applicationData = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        idNumber: formData.idNumber,
       dateOfBirth: formData.dateOfBirth && formData.dateOfBirth !== '' ? formData.dateOfBirth : null,
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
        documents: {
          id: documents.id.path || null,
          results: documents.results.path || null
        },
        package: summary.package,
        universities: summary.universities,
        totalCourses: summary.totalCourses,
        totalUniversities: summary.totalUniversities,
        totalCost: summary.totalCost,
        courseDetails: summary.courseDetails
      };
    }
    
    // Submit order first
    const orderResponse = await fetch(`${API_URL}/api/submit-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        gender: formData.gender,
        province: formData.province,
        city: formData.city,
        homeLanguage: formData.homeLanguage,
        nationality: formData.nationality,
        idNumber: formData.idNumber,
        dateOfBirth: formData.dateOfBirth,
        kinName: formData.kinName,
        kinPhone: formData.kinPhone,
        package: applicationData.package,
        amount: totalAmount,
        universities: applicationData.universities,
        courses: applicationData.courseDetails,
        transactionId: transactionId,
        paymentMethod: paymentMethod
      })
    });
    
    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(`Order submission failed: ${errorData.error || errorData.message}`);
    }
    
    const orderResult = await orderResponse.json();
    let trackingNumber = orderResult.trackingNumber;
    
    if (!trackingNumber) {
      throw new Error('No tracking number received from server');
    }
    
    console.log('✅ Got tracking number from backend:', trackingNumber);
    
    // Save payment selection - FIXED VERSION
    if (applicationData.package) {
      console.log('📥 Saving payment selection with tracking:', trackingNumber);
      
      const paymentSelectionData = {
        selectedPackage: applicationData.package,
        universities: applicationData.universities,
        totalCourses: applicationData.totalCourses,
        totalUniversities: applicationData.totalUniversities,
        totalCost: applicationData.totalCost,
        courseDetails: applicationData.courseDetails
      };
      
      console.log('📤 Payment selection data:', paymentSelectionData);
      
      try {
        const paymentResponse = await fetch(`${API_URL}/api/payment/save-selection`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(paymentSelectionData)
        });
        
        if (!paymentResponse.ok) {
          const errorText = await paymentResponse.text();
          console.error('❌ Payment selection save failed:', errorText);
          // Don't throw - continue with application save
        } else {
          const paymentResult = await paymentResponse.json();
          console.log('✅ Payment selection saved:', paymentResult);
        }
      } catch (paymentError) {
        console.error('❌ Payment selection error:', paymentError);
        // Continue anyway - main application is more important
      }
    }
    
    // Save application
    const appResponse = await fetch(`${API_URL}/api/applications/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        gender: formData.gender,
        province: formData.province,
        city: formData.city,
        homeLanguage: formData.homeLanguage,
        nationality: formData.nationality,
        idNumber: formData.idNumber,
        dateOfBirth: formData.dateOfBirth,
        kinName: formData.kinName,
        kinPhone: formData.kinPhone,
        trackingNumber: trackingNumber,
        documents: {
          id: documents.id.path || null,
          results: documents.results.path || null
        }
      })
    });
    
    if (!appResponse.ok) {
      const errorData = await appResponse.json();
      throw new Error(`Application save failed: ${errorData.error || errorData.message}`);
    }
    
    const appResult = await appResponse.json();
    console.log('✅ Application saved with tracking:', appResult.trackingNumber || trackingNumber);
    
    localStorage.setItem('paymentTrackingNumber', trackingNumber);
    
    sessionStorage.removeItem('pendingApplicationSummary');
    
    return trackingNumber;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      const tempTransactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const trackingNumber = await saveApplicationData(tempTransactionId, 'pending');
      
      setPendingTransactionData({
        trackingNumber,
        tempTransactionId,
        amount: totalAmount,
        package: selectedPackage
      });
      
      setShowPaymentModal(true);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('❌ Error creating application:', error);
      setError(error.message || 'Failed to process. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleBankTransfer = () => {
    if (!pendingTransactionData) return;
    
    // Store payment pending info
    localStorage.setItem('hasCompletedPayment', 'false');
    localStorage.setItem('lastPaymentTrackingNumber', pendingTransactionData.trackingNumber);
    localStorage.setItem('pendingBankTransfer', JSON.stringify({
      trackingNumber: pendingTransactionData.trackingNumber,
      amount: pendingTransactionData.amount,
      package: pendingTransactionData.package,
      idNumber: formData.idNumber,
      date: new Date().toISOString()
    }));
    
    setShowPaymentModal(false);
    
    // Show success message with instructions
    alert(`✅ Application Submitted Successfully!\n\nPlease complete your payment via bank transfer:\n\nBank: ${bankDetails.bankName}\nAccount Name: ${bankDetails.accountName}\nAccount Number: ${bankDetails.accountNumber}\nBranch Code: ${bankDetails.branchCode}\n\nReference: ${formData.idNumber}\n\nAmount: R${totalAmount}\n\nYour application will be processed once payment is confirmed. You will receive an email confirmation shortly.`);
    
    if (onPaymentComplete) {
      onPaymentComplete(pendingTransactionData.trackingNumber);
    }
    
    onClose();
    navigate('/dashboard');
  };

  const handleYocoPayment = () => {
    if (!pendingTransactionData) return;
    
    const paymentLink = packageLinks[selectedPackage];
    if (!paymentLink) {
      setError('Invalid package selected');
      setShowPaymentModal(false);
      return;
    }
    
    sessionStorage.setItem('pendingPayment', JSON.stringify({
      trackingNumber: pendingTransactionData.trackingNumber,
      selectedPackage,
      totalAmount,
      timestamp: Date.now()
    }));
    
    window.location.href = paymentLink;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'bank') {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  if (!isOpen) return null;

  if (isLoadingCheck) {
    return (
      <div className="money-overlay">
        <div className="money-container narrow">
          <div className="loading-profile">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="money-overlay">
        <div className="money-container narrow" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <button className="money-close" onClick={onClose}>
            <FaTimes />
          </button>

          <div className="money-header">
            <h2>Complete Your Payment</h2>
            <p>
              {hasCompletedPaymentBefore 
                ? 'Welcome back! Your information is already saved. Complete your payment below.' 
                : 'Please provide all your details for the university applications'}
            </p>
          </div>

          {hasCompletedPaymentBefore && (
            <div className="welcome-back-banner">
              <FaUser className="welcome-icon" />
              <div className="welcome-text">
                <span className="welcome-greeting">Welcome back, {formData.firstName || 'Valued Customer'}!</span>
                <span className="welcome-message">Your details are already saved. Just complete your payment below.</span>
              </div>
            </div>
          )}

          {isLoadingProfile && (
            <div className="loading-profile">
              <FaSpinner className="spinner-icon" /> Loading...
            </div>
          )}

          {error && (
            <div className="money-error">
              {error}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="money-form">
            {/* Show FULL FORM for first-time applicants ONLY */}
            {!hasCompletedPaymentBefore && (
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
                    <small className="field-note">This will be used for verification and payment reference</small>
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
                            onClick={() => setDocuments({...documents, id: { name: null, uploaded: false, file: null, path: null }})}
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
                            onClick={() => setDocuments({...documents, results: { name: null, uploaded: false, file: null, path: null }})}
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

            {/* Show saved info summary for returning users */}
            {hasCompletedPaymentBefore && (
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
            )}
                    
            <div className="payment-info-note">
              <FaSpinner className="info-spinner" />
              <span>Payment may take up to 60 seconds to load. Please wait and don't refresh.</span>
            </div>

            {/* Pay Button - Shows Payment Options Modal */}
            <button 
              type="button"
              onClick={handleProceedToPayment}
              className="pay-now-btn"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="spinner-icon" /> Processing...
                </>
              ) : (
                `Proceed to Payment - R${totalAmount}`
              )}
            </button>

            <p className="secure-payment">
              🔒 All information is encrypted and secure
            </p>
          </form>
        </div>
      </div>

            {/* Payment Options Modal - MINIMALISTIC */}
      {showPaymentModal && (
        <div className="payment-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="payment-modal-close" onClick={() => setShowPaymentModal(false)}>
              <FaTimes />
            </button>
            
            <div className="payment-modal-header">
              <h2>Complete Payment</h2>
              <p className="payment-amount">R{totalAmount}</p>
            </div>

            <div className="payment-options-simple">
              {/* Skolify Direct Payment - Recommended */}
              <button 
                className="payment-option-simple primary"
                onClick={() => {
                  setShowPaymentModal(false);
                  // Store payment completion
                  localStorage.setItem('hasCompletedPayment', 'true');
                  localStorage.setItem('lastPaymentTrackingNumber', pendingTransactionData?.trackingNumber);
                  
                  if (onPaymentComplete) {
                    onPaymentComplete(pendingTransactionData?.trackingNumber);
                  }
                  
                  // Show success message
                  alert(`✅ Payment Successful!\n\nTracking Number: ${pendingTransactionData?.trackingNumber}\n\nYour application has been submitted. You will receive a confirmation email shortly.`);
                  
                  onClose();
                  navigate('/profile');
                }}
              >
                <div className="payment-option-icon">💰</div>
                <div className="payment-option-content">
                  <span className="payment-option-title">Skolify Direct Payment</span>
                  <span className="payment-option-desc">Recommended • Instant confirmation</span>
                </div>
                <div className="payment-option-check">→</div>
              </button>

              {/* Bank Transfer Option */}
              <button 
                className="payment-option-simple"
                onClick={() => {
                  setShowPaymentModal(false);
                  // Copy bank details to clipboard
                  const bankDetailsText = `Bank: First National Bank (FNB)\nAccount Name: K2026084461 (South Africa) (pty) Ltd\nAccount Number: 63199178419\nBranch Code: 250655\nReference: ${formData.idNumber || 'YOUR ID NUMBER'}\nAmount: R${totalAmount}`;
                  navigator.clipboard.writeText(bankDetailsText);
                  
                  alert(`💰 Bank Transfer Details Copied!\n\nBank: FNB\nAccount: 63199178419\nRef: ${formData.idNumber || 'YOUR ID NUMBER'}\nAmount: R${totalAmount}\n\nUse your ID number as reference. We'll confirm payment within 24 hours.`);
                  
                  if (onPaymentComplete) {
                    onPaymentComplete(pendingTransactionData?.trackingNumber);
                  }
                  onClose();
                  navigate('/profile');
                }}
              >
                <div className="payment-option-icon">🏦</div>
                <div className="payment-option-content">
                  <span className="payment-option-title">Bank Transfer</span>
                  <span className="payment-option-desc">EFT / Direct Deposit</span>
                </div>
                <div className="payment-option-check">→</div>
              </button>
            </div>

            <p className="payment-modal-footer-simple">
              Your ID: <strong>{formData.idNumber || 'Not provided'}</strong> • Payment reference
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Money;