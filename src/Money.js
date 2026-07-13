import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Money.css';
import { 
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaGraduationCap, 
  FaTimes, FaCheck, FaUpload, FaHome, FaUserTie, FaPhoneAlt, FaWhatsapp, 
  FaInfoCircle, FaSpinner, FaCreditCard,
  FaSchool, FaMapMarkerAlt, FaCity, FaBuilding, FaCalendarAlt, FaLaptop,
  FaMoneyBillWave, FaSave
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
  const [showSaveForLaterPopup, setShowSaveForLaterPopup] = useState(false);
  const [isSavingForLater, setIsSavingForLater] = useState(false);
  
  // Yoco checkout states
  const [yocoPollingInterval, setYocoPollingInterval] = useState(null);
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  // SmartClass leads
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [needsHelp, setNeedsHelp] = useState(false);
  const [hasLaptop, setHasLaptop] = useState(false);
  const [requiresNsfas, setRequiresNsfas] = useState(false);
  
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
    previousSchool: '',
    previousSchoolProvince: '',
    previousSchoolYear: '',
    kinName: '',
    kinRelationship: '',
    kinIdNumber: '',
    kinGender: '',
    kinPhone: '',
    kinEmail: '',
  });
  
  const [documents, setDocuments] = useState({
    id: { name: null, uploaded: false, file: null, path: null },
    results: { name: null, uploaded: false, file: null, path: null }
  });

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (yocoPollingInterval) clearInterval(yocoPollingInterval);
    };
  }, [yocoPollingInterval]);

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
            kinIdNumber: data.user.kin_id_number || '',
            kinGender: data.user.kin_gender || '',
            dateOfBirth: data.user.date_of_birth || '',
            address: data.user.address || '',
            suburb: data.user.suburb || '',
            postalCode: data.user.postal_code || '',
            kinRelationship: data.user.kin_relationship || '',
            kinEmail: data.user.kin_email || '',
            previousSchool: data.user.previous_school || '',
            previousSchoolProvince: data.user.previous_school_province || '',
            previousSchoolYear: data.user.previous_school_year || ''
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
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phoneNumber || formData.phoneNumber.trim().length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!formData.whatsappNumber || formData.whatsappNumber.trim().length < 10) {
      setError('Please enter a valid WhatsApp number');
      return false;
    }
    return true;
  };

  // Save profile data to backend
  const saveProfileData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/user/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          idNumber: formData.idNumber,
          dateOfBirth: formData.dateOfBirth,
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
          previousSchool: formData.previousSchool,
          previousSchoolProvince: formData.previousSchoolProvince,
          previousSchoolYear: formData.previousSchoolYear,
          kinName: formData.kinName,
          kinRelationship: formData.kinRelationship,
          kinIdNumber: formData.kinIdNumber,
          kinGender: formData.kinGender,
          kinPhone: formData.kinPhone,
          kinEmail: formData.kinEmail,
          documents: {
            id: documents.id.path || null,
            results: documents.results.path || null
          }
        })
      });
      
      if (response.ok) {
        console.log('✅ Profile data saved');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  // Save SmartClass lead to database
  const saveSmartClassLead = async () => {
    if (!needsHelp && !isUpgrading && !hasLaptop && !requiresNsfas) return;
    
    const token = localStorage.getItem('authToken');
    try {
      await fetch(`${API_URL}/api/smartclass/lead`, {
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
          isUpgrading: isUpgrading,
          needsHelp: needsHelp,
          hasLaptop: hasLaptop,
          requiresNsfas: requiresNsfas,
          previousSchool: formData.previousSchool,
          previousSchoolYear: formData.previousSchoolYear
        })
      });
      console.log('📚 SmartClass lead saved');
    } catch (e) {
      console.error('SmartClass lead error:', e);
    }
  };

  const saveApplicationData = async (transactionId) => {
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
        previousSchool: formData.previousSchool,
        previousSchoolProvince: formData.previousSchoolProvince,
        previousSchoolYear: formData.previousSchoolYear,
        kinName: formData.kinName,
        kinRelationship: formData.kinRelationship,
        kinIdNumber: formData.kinIdNumber,
        kinGender: formData.kinGender,
        kinPhone: formData.kinPhone,
        kinEmail: formData.kinEmail,
        requiresNsfas: requiresNsfas,
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
    
    // Save SmartClass lead
    await saveSmartClassLead();
    
    // Save profile data
    await saveProfileData();
    
    // Submit order
    const orderResponse = await fetch(`${API_URL}/api/payment/submit-order`, {
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
        kinIdNumber: formData.kinIdNumber,
        kinGender: formData.kinGender,
        requiresNsfas: requiresNsfas,
        package: applicationData.package,
        amount: totalAmount,
        universities: applicationData.universities,
        courses: applicationData.courseDetails,
        transactionId: transactionId,
        paymentMethod: 'yoco',
        isUpgrading: isUpgrading,
        needsHelp: needsHelp,
        hasLaptop: hasLaptop
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
    
    console.log('✅ Got tracking number:', trackingNumber);
    
    // Save payment selection
    if (applicationData.package) {
      const paymentSelectionData = {
        selectedPackage: applicationData.package,
        universities: applicationData.universities,
        totalCourses: applicationData.totalCourses,
        totalUniversities: applicationData.totalUniversities,
        totalCost: applicationData.totalCost,
        courseDetails: applicationData.courseDetails
      };
      
      try {
        await fetch(`${API_URL}/api/payment/save-selection`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(paymentSelectionData)
        });
      } catch (paymentError) {
        console.error('❌ Payment selection error:', paymentError);
      }
    }
    
    // Create application
    const appResponse = await fetch(`${API_URL}/api/applications/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tracking_number: trackingNumber,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        idNumber: formData.idNumber,
        dateOfBirth: formData.dateOfBirth && formData.dateOfBirth !== '' ? formData.dateOfBirth : null,
        gender: formData.gender,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        address: formData.address,
        suburb: formData.suburb,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        homeLanguage: formData.homeLanguage,
        nationality: formData.nationality,
        previousSchool: formData.previousSchool,
        previousSchoolProvince: formData.previousSchoolProvince,
        previousSchoolYear: formData.previousSchoolYear,
        kinName: formData.kinName,
        kinPhone: formData.kinPhone,
        kinRelationship: formData.kinRelationship,
        kinIdNumber: formData.kinIdNumber,
        kinGender: formData.kinGender,
        kinEmail: formData.kinEmail,
        requiresNsfas: requiresNsfas,
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
    
    console.log('✅ Application saved');
    
    localStorage.setItem('paymentTrackingNumber', trackingNumber);
    sessionStorage.removeItem('pendingApplicationSummary');
    
    return trackingNumber;
  };

  // Save profile without payment (for "Save for Later")
  const saveProfileForLater = async () => {
    setIsSavingForLater(true);
    
    try {
      await saveProfileData();
      await saveSmartClassLead();
      
      // Save payment selection as pending
      const pendingSummary = sessionStorage.getItem('pendingApplicationSummary');
      if (pendingSummary) {
        const token = localStorage.getItem('authToken');
        const summary = JSON.parse(pendingSummary);
        const paymentSelectionData = {
          selectedPackage: summary.package,
          universities: summary.universities,
          totalCourses: summary.totalCourses,
          totalUniversities: summary.totalUniversities,
          totalCost: summary.totalCost,
          courseDetails: summary.courseDetails,
          status: 'pending_payment'
        };
        
        await fetch(`${API_URL}/api/payment/save-selection`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(paymentSelectionData)
        });
      }
      
      setShowSaveForLaterPopup(false);
      onClose();
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save. Please try again.');
    } finally {
      setIsSavingForLater(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setPaymentError('');

    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const pendingSummary = sessionStorage.getItem('pendingApplicationSummary');
    
    let universitiesData = [];
    let pkg = selectedPackage || 'per_university';
    let isTermSale = false;
    
    if (pendingSummary) {
      try {
        const summary = JSON.parse(pendingSummary);
        universitiesData = summary.universities || [];
        pkg = summary.package || pkg;
        isTermSale = summary.isTermSale || false;
      } catch (e) {}
    }

    try {
      // Save application data first (gets tracking number)
      const tempTransactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const trackingNumber = await saveApplicationData(tempTransactionId);
      
      // Create Yoco checkout
      const createResponse = await fetch(`${API_URL}/api/payment/create-application-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: totalAmount,
          email: formData.email || user.email || '',
          name: `${formData.firstName || user.firstName || ''} ${formData.lastName || user.lastName || ''}`.trim() || 'Student',
          universities: universitiesData,
          selectedPackage: pkg,
          isTermSale: isTermSale
        })
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create payment');
      }

      localStorage.setItem('application_checkout_id', createData.checkoutId);
      localStorage.setItem('application_payment_pending', 'true');

      // Open Yoco checkout in new tab
      window.open(createData.redirectUrl, '_blank');

      // Show waiting state
      setIsProcessing(false);
      setIsWaitingForPayment(true);

      // Poll for payment confirmation
      const interval = setInterval(async () => {
        try {
          const verifyResponse = await fetch(`${API_URL}/api/payment/verify-application-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ checkoutId: createData.checkoutId })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success && verifyData.status === 'completed') {
            clearInterval(interval);
            setYocoPollingInterval(null);
            localStorage.removeItem('application_payment_pending');
            localStorage.removeItem('application_checkout_id');
            localStorage.removeItem('selectedUniversityCourses');
            localStorage.removeItem('isTermSaleActive');
            setIsWaitingForPayment(false);
            
            if (onPaymentComplete) {
              onPaymentComplete({ success: true, transactionId: trackingNumber });
            }
            
            onClose();
            navigate('/profile');
          }
        } catch (e) {
          // Keep polling
        }
      }, 3000);

      setYocoPollingInterval(interval);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
        setYocoPollingInterval(null);
        if (isWaitingForPayment) {
          setIsWaitingForPayment(false);
          setPaymentError('Payment not confirmed. Please contact support if you completed the payment.');
        }
      }, 300000);

    } catch (error) {
      setError(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Handle close button - show save for later popup
  const handleCloseClick = () => {
    if (!hasCompletedPaymentBefore) {
      setShowSaveForLaterPopup(true);
    } else {
      onClose();
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
          <button className="money-close" onClick={handleCloseClick}>
            <FaTimes />
          </button>

          <div className="money-header">
            <h2>Complete Your Payment</h2>
            <p>
              {hasCompletedPaymentBefore 
                ? 'Welcome back! Your information is already saved. Complete your payment below.' 
                : 'Please provide your details for the university applications'}
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

          {isWaitingForPayment && (
            <div className="money-error" style={{ background: '#e8f0fe', border: '1px solid #007bff', color: '#007bff' }}>
              <FaSpinner className="spinner-icon" /> Payment tab opened. Complete payment to continue...
            </div>
          )}

          {paymentError && (
            <div className="money-error">
              {paymentError}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="money-form">
            {/* Show FULL FORM for first-time applicants ONLY */}
            {!hasCompletedPaymentBefore && (
              <>
                {/* Section 1: Personal Information */}
                <div className="money-section-card">
                  <div className="section-title">
                    <span className="section-number">1</span>
                    <h3>Personal Information</h3>
                  </div>
                  
                  <div className="money-row">
                    <div className="money-group">
                      <label><FaUser /> First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
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
                    <label><FaUser /> Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="money-group">
                    <label><FaIdCard /> ID / Passport Number</label>
                    <input
                      type="text"
                      name="idNumber"
                      placeholder="000101 5084 089"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                    />
                    <small className="field-note">This will be used for verification and payment reference</small>
                  </div>

                  <div className="money-row">
                    <div className="money-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="money-group">
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
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
                      <label>Nationality</label>
                      <input
                        type="text"
                        name="nationality"
                        placeholder="South African"
                        value={formData.nationality}
                        onChange={handleInputChange}
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

                {/* Section 2: Contact Information */}
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

                {/* Section 3: Residential Address */}
                <div className="money-section-card">
                  <div className="section-title">
                    <span className="section-number">3</span>
                    <h3>Residential Address</h3>
                  </div>
                  
                  <div className="money-group">
                    <label><FaHome /> Street Address</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="123 Main Street, Unit 4B"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                    <small className="field-note">Include house/unit number and street name</small>
                  </div>

                  <div className="money-group">
                    <label><FaBuilding /> Suburb / Area</label>
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
                      <label><FaCity /> City / Town</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="Johannesburg"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="money-group">
                      <label><FaMapMarkerAlt /> Province</label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
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
                    <label>Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="2000"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Section 4: Previous School Attended + SmartClass Lead Capture */}
                <div className="money-section-card">
                  <div className="section-title">
                    <span className="section-number">4</span>
                    <h3>Previous School Attended</h3>
                  </div>
                  
                  <div className="money-group">
                    <label><FaSchool /> School Name</label>
                    <input
                      type="text"
                      name="previousSchool"
                      placeholder="e.g. Parktown High School"
                      value={formData.previousSchool}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="money-row">
                    <div className="money-group">
                      <label><FaMapMarkerAlt /> School Province</label>
                      <select
                        name="previousSchoolProvince"
                        value={formData.previousSchoolProvince}
                        onChange={handleInputChange}
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

                    <div className="money-group">
                      <label><FaCalendarAlt /> Year Completed/Attended</label>
                      <input
                        type="text"
                        name="previousSchoolYear"
                        placeholder="2023"
                        value={formData.previousSchoolYear}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* SmartClass Lead Capture */}
                  <div className="smartclass-lead-section">
                    <div className="smartclass-checkbox-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={isUpgrading}
                          onChange={(e) => setIsUpgrading(e.target.checked)}
                        />
                        <span>Are you currently upgrading your marks?</span>
                      </label>
                    </div>
                    
                    <div className="smartclass-checkbox-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={needsHelp}
                          onChange={(e) => setNeedsHelp(e.target.checked)}
                        />
                        <span>Do you need help with your studies?</span>
                      </label>
                    </div>

                    <div className="smartclass-checkbox-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={hasLaptop}
                          onChange={(e) => setHasLaptop(e.target.checked)}
                        />
                        <span><FaLaptop style={{ marginRight: '4px' }} />Do you have access to a laptop/computer?</span>
                      </label>
                    </div>

                    <div className="smartclass-checkbox-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={requiresNsfas}
                          onChange={(e) => setRequiresNsfas(e.target.checked)}
                        />
                        <span><FaMoneyBillWave style={{ marginRight: '4px' }} />Do you require NSFAS funding?</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 5: Next of Kin / Emergency Contact */}
                <div className="money-section-card">
                  <div className="section-title">
                    <span className="section-number">5</span>
                    <h3>Next of Kin / Emergency Contact</h3>
                  </div>
                  
                  <div className="money-group">
                    <label><FaUserTie /> Full Name</label>
                    <input
                      type="text"
                      name="kinName"
                      placeholder="Jane Doe"
                      value={formData.kinName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="money-row">
                    <div className="money-group">
                      <label><FaIdCard /> ID Number</label>
                      <input
                        type="text"
                        name="kinIdNumber"
                        placeholder="800505 0187 085"
                        value={formData.kinIdNumber}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="money-group">
                      <label>Gender</label>
                      <select
                        name="kinGender"
                        value={formData.kinGender}
                        onChange={handleInputChange}
                        className="money-select"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="money-group">
                    <label>Relationship</label>
                    <select
                      name="kinRelationship"
                      value={formData.kinRelationship}
                      onChange={handleInputChange}
                      className="money-select"
                    >
                      <option value="">Select Relationship</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other Relative">Other Relative</option>
                      <option value="Friend">Friend</option>
                    </select>
                  </div>

                  <div className="money-row">
                    <div className="money-group">
                      <label><FaPhoneAlt /> Phone Number</label>
                      <input
                        type="tel"
                        name="kinPhone"
                        placeholder="+27 11 123 4567"
                        value={formData.kinPhone}
                        onChange={handleInputChange}
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

                {/* Section 6: Documents */}
                <div className="money-section-card">
                  <div className="section-title">
                    <span className="section-number">6</span>
                    <h3>Documents</h3>
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

            {/* Pay Button */}
            <button 
              type="button"
              onClick={handleProceedToPayment}
              disabled={isProcessing || isWaitingForPayment}
              style={{
                width: '100%',
                padding: '18px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: (isProcessing || isWaitingForPayment) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit',
                opacity: (isProcessing || isWaitingForPayment) ? 0.7 : 1,
                letterSpacing: '0.5px'
              }}
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="spinner-icon" /> Processing...
                </>
              ) : isWaitingForPayment ? (
                <>
                  <FaSpinner className="spinner-icon" /> Waiting for payment...
                </>
              ) : (
                `Pay R${totalAmount}`
              )}
            </button>

            <p className="secure-payment">
              🔒 Secure payment via Yoco
            </p>
          </form>
        </div>
      </div>

      {/* SAVE PROFILE POPUP */}
      {showSaveForLaterPopup && (
        <div className="save-for-later-overlay" onClick={() => setShowSaveForLaterPopup(false)}>
          <div className="save-for-later-modal" onClick={(e) => e.stopPropagation()}>
            <button className="save-for-later-close" onClick={() => setShowSaveForLaterPopup(false)}>
              <FaTimes />
            </button>
            
            <h3>Save profile for later?</h3>
            
            <div className="save-for-later-actions">
              <button 
                className="save-for-later-btn primary"
                onClick={saveProfileForLater}
                disabled={isSavingForLater}
              >
                {isSavingForLater ? <><FaSpinner className="spinner-icon" /> Saving...</> : 'Yes'}
              </button>
              
              <button 
                className="save-for-later-btn secondary"
                onClick={() => {
                  setShowSaveForLaterPopup(false);
                  onClose();
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Money;