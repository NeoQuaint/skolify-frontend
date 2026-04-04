import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Money.css';
import { 
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaGraduationCap, FaCreditCard, 
  FaTimes, FaCheck, FaUpload, FaHome, FaUserTie, FaPhoneAlt, FaWhatsapp, 
  FaChevronDown, FaChevronUp, FaInfoCircle, FaUniversity, FaSpinner, FaLock, FaEye, FaEyeSlash
} from 'react-icons/fa';
import PayFastPayment from './PayFastPayment';
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
    console.log('🔵 Money component - Retrieved tracking from sessionStorage:', tracking);
    return tracking || null;
  });

  // Clear sessionStorage after reading
  useEffect(() => {
    if (paymentTrackingNumber) {
      console.log('🔵 Money component - Using tracking number:', paymentTrackingNumber);
      sessionStorage.removeItem('paymentTrackingNumber');
    }
  }, [paymentTrackingNumber]);

  // State for toggling all sections
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('credit');
  
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
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvc: ''
  });
  
  const [documents, setDocuments] = useState({
    id: { name: null, uploaded: false, file: null },
    results: { name: null, uploaded: false, file: null }
  });
  
 const [isProcessing, setIsProcessing] = useState(false);
const [error, setError] = useState('');
const [fieldErrors, setFieldErrors] = useState({ id: '', results: '' });
const [isUploading, setIsUploading] = useState(false);  
const [backendTrackingNumber, setBackendTrackingNumber] = useState(null);

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
          console.log('🔍 Fetching user profile...');
          const response = await fetch(`${API_URL}/api/user/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          console.log('📥 Profile data received:', data);
          
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
            console.log('✅ Profile loaded for:', data.user.first_name);
          }
        } catch (error) {
          console.error('❌ Error fetching profile:', error);
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
    
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      if (cleaned.length <= 16) {
        const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
    } 
    else if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 4) {
        let formatted = cleaned;
        if (cleaned.length > 2) {
          formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
    }
    else if (name === 'cvc') {
      if (value.length <= 4) {
        setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
      }
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // UPDATED: Enhanced file upload handler with specific error messages
  const handleFileUpload = async (type, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setError('');
    setFieldErrors(prev => ({ ...prev, [type]: '' }));
    
    const formData = new FormData();
    formData.append(type, file);
    
    try {
      const response = await fetch(`${API_URL}/api/upload-documents`, {
        method: 'POST',
        body: formData
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
    // For PayFast, we don't need card validation
    if (paymentMethod === 'payfast') {
      if (isLoggedIn) return true;
      
      // For non-logged-in users with PayFast, validate personal info, password, but not card
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
      // Password validation for new users - 8 characters
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
      if (!formData.dateOfBirth) {
        setError('Please enter your date of birth');
        return false;
      }
      if (!formData.gender) {
        setError('Please select your gender');
        return false;
      }
      if (!formData.nationality) {
        setError('Please enter your nationality');
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
      if (!formData.whatsappNumber || formData.whatsappNumber.trim().length < 10) {
        setError('Please enter a valid WhatsApp number');
        return false;
      }
      if (!formData.address || formData.address.trim().length < 3) {
        setError('Please enter your street address');
        return false;
      }
      if (!formData.city || formData.city.trim().length < 2) {
        setError('Please enter your city');
        return false;
      }
      if (!formData.province) {
        setError('Please select your province');
        return false;
      }
      if (!formData.postalCode || formData.postalCode.trim().length < 4) {
        setError('Please enter a valid postal code');
        return false;
      }
      if (!formData.kinName || formData.kinName.trim().length < 3) {
        setError('Please enter next of kin full name');
        return false;
      }
      if (!formData.kinRelationship || formData.kinRelationship.trim().length < 2) {
        setError('Please enter relationship with next of kin');
        return false;
      }
      if (!formData.kinPhone || formData.kinPhone.trim().length < 10) {
        setError('Please enter a valid next of kin phone number');
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

    // For logged-in users with credit card, only validate card details
    if (isLoggedIn) {
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number');
        return false;
      }
      if (!formData.cardName || formData.cardName.trim().length < 3) {
        setError('Please enter the name on card');
        return false;
      }
      if (!formData.expiryDate || formData.expiryDate.length < 5) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (!formData.cvc || formData.cvc.length < 3) {
        setError('Please enter a valid CVC');
        return false;
      }
      return true;
    }

    // For non-logged-in users with credit card, validate everything including password
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
    // Password validation for new users - 8 characters
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Please enter your date of birth');
      return false;
    }
    if (!formData.gender) {
      setError('Please select your gender');
      return false;
    }
    if (!formData.nationality) {
      setError('Please enter your nationality');
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
    if (!formData.whatsappNumber || formData.whatsappNumber.trim().length < 10) {
      setError('Please enter a valid WhatsApp number');
      return false;
    }
    if (!formData.address || formData.address.trim().length < 3) {
      setError('Please enter your street address');
      return false;
    }
    if (!formData.city || formData.city.trim().length < 2) {
      setError('Please enter your city');
      return false;
    }
    if (!formData.province) {
      setError('Please select your province');
      return false;
    }
    if (!formData.postalCode || formData.postalCode.trim().length < 4) {
      setError('Please enter a valid postal code');
      return false;
    }
    if (!formData.kinName || formData.kinName.trim().length < 3) {
      setError('Please enter next of kin full name');
      return false;
    }
    if (!formData.kinRelationship || formData.kinRelationship.trim().length < 2) {
      setError('Please enter relationship with next of kin');
      return false;
    }
    if (!formData.kinPhone || formData.kinPhone.trim().length < 10) {
      setError('Please enter a valid next of kin phone number');
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
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    if (!formData.cardName || formData.cardName.trim().length < 3) {
      setError('Please enter the name on card');
      return false;
    }
    if (!formData.expiryDate || formData.expiryDate.length < 5) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (!formData.cvc || formData.cvc.length < 3) {
      setError('Please enter a valid CVC');
      return false;
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

    console.log('📤 SENDING TO DATABASE WITH TRACKING:', trackingNumber, applicationData);

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
      console.log('📥 SERVER RESPONSE:', result);
      
      return result;
    } catch (error) {
      console.error('❌ NETWORK ERROR:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // If PayFast is selected, the PayFast component handles the redirect
    if (paymentMethod === 'payfast') {
      // The PayFast component will handle the redirect
      return;
    }

    // Existing credit card flow continues here...
    setIsProcessing(true);
    setError('');

    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    if (documents.id.file) {
      formDataToSend.append('id', documents.id.file);
    }
    if (documents.results.file) {
      formDataToSend.append('results', documents.results.file);
    }

    let finalTrackingNumber;
    
    if (paymentTrackingNumber) {
      finalTrackingNumber = paymentTrackingNumber;
      console.log('🔵 Using tracking number from PaymentPage:', finalTrackingNumber);
    } else {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      finalTrackingNumber = `SKL-${dateStr}-${random}`;
      console.log('⚠️ No tracking from PaymentPage, generated TEMP tracking:', finalTrackingNumber);
    }
    
    formDataToSend.append('trackingNumber', finalTrackingNumber);
    formDataToSend.append('totalAmount', totalAmount);
    formDataToSend.append('paymentMethod', paymentMethod);

    try {
      const uploadResponse = await fetch(`${API_URL}/api/upload-documents`, {
        method: 'POST',
        body: formDataToSend
      });

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error('File upload failed');
      }

      console.log('✅ Files uploaded:', uploadResult.paths);

      let accountCredentials = null;

      if (!isLoggedIn) {
        try {
          console.log('📝 Creating account with custom password...');

          const response = await fetch(`${API_URL}/api/auth/create-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              idNumber: formData.idNumber,
              email: formData.email,
              password: formData.password
            })
          });
          
          const result = await response.json();
          console.log('📥 Account creation response:', result);
          
          if (result.success && result.newUser) {
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            accountCredentials = {
              username: result.credentials.username,
              password: formData.password
            };
            
            try {
              const savedSelection = localStorage.getItem('applicationSummary');
              console.log('📦 Saved selection from localStorage:', savedSelection);
              
              if (savedSelection) {
                const selectionData = JSON.parse(savedSelection);
                console.log('📤 Transferring payment selection to database:', selectionData);
                
                const paymentResponse = await fetch(`${API_URL}/api/payment/save-selection`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${result.token}`
                  },
                  body: JSON.stringify({
                    selectedPackage: selectionData.package,
                    universities: selectionData.universities,
                    totalCourses: selectionData.totalCourses,
                    totalUniversities: selectionData.totalUniversities,
                    totalCost: selectionData.totalCost,
                    courseDetails: selectionData.courseDetails || []
                  })
                });
                
                const paymentResult = await paymentResponse.json();
                console.log('📥 Payment selection transfer response:', paymentResult);
                
                if (paymentResult.success) {
                  const backendTrackingNumber = paymentResult.trackingNumber;
                  console.log('✅ Payment selection saved with backend tracking:', backendTrackingNumber);
                  
                  setBackendTrackingNumber(backendTrackingNumber);
                  
                  const updatedSelection = {
                    ...selectionData,
                    trackingNumber: backendTrackingNumber
                  };
                  localStorage.setItem('applicationSummary', JSON.stringify(updatedSelection));
                  
                  finalTrackingNumber = backendTrackingNumber;
                  
                  const saveResult = await saveApplicationToDatabase(backendTrackingNumber, uploadResult.paths);
                  if (saveResult.success) {
                    console.log('✅ Application saved with backend tracking:', backendTrackingNumber);
                  }
                } else {
                  console.log('⚠️ Payment selection failed, using current tracking for application');
                  const saveResult = await saveApplicationToDatabase(finalTrackingNumber, uploadResult.paths);
                  if (saveResult.success) {
                    console.log('✅ Application saved with tracking:', finalTrackingNumber);
                  }
                }
              }
            } catch (transferError) {
              console.error('❌ Error transferring payment selection:', transferError);
              const saveResult = await saveApplicationToDatabase(finalTrackingNumber, uploadResult.paths);
              if (saveResult.success) {
                console.log('✅ Application saved with tracking after error:', finalTrackingNumber);
              }
            }
            
          } else if (result.success && result.existingUser) {
            console.log('👤 User already exists, logging in...');
            
            const signInResponse = await fetch(`${API_URL}/api/auth/signin`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: result.user.username,
                password: formData.password
              })
            });
            
            const signInResult = await signInResponse.json();
            if (signInResult.success) {
              localStorage.setItem('authToken', signInResult.token);
              localStorage.setItem('user', JSON.stringify(signInResult.user));
            }
          }
        } catch (error) {
          console.error('❌ Account creation error:', error);
        }
      } else {
        try {
          const saveResult = await saveApplicationToDatabase(finalTrackingNumber, uploadResult.paths);
          if (saveResult.success) {
            console.log('✅ Application saved with tracking:', finalTrackingNumber);
          }
        } catch (error) {
          console.error('❌ Error in logged-in payment flow:', error);
        }
      }
      
      setTimeout(() => {
        setIsProcessing(false);
        
        const profileData = {
          ...formData,
          documents: {
            id: documents.id.name,
            results: documents.results.name
          }
        };
        localStorage.setItem('userProfileData', JSON.stringify(profileData));
        
        onPaymentComplete({
          success: true,
          transactionId: finalTrackingNumber,
          amount: totalAmount,
          method: paymentMethod,
          cardLast4: formData.cardNumber?.slice(-4) || '',
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          fullName: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          whatsappNumber: formData.whatsappNumber,
          idNumber: formData.idNumber,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          nationality: formData.nationality,
          homeLanguage: formData.homeLanguage,
          address: formData.address,
          suburb: formData.suburb,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
          kinName: formData.kinName,
          kinRelationship: formData.kinRelationship,
          kinPhone: formData.kinPhone,
          kinEmail: formData.kinEmail,
          documents: documents,
          trackingNumber: finalTrackingNumber,
          password: formData.password,
          ...(accountCredentials && {
            showCredentials: true,
            username: accountCredentials.username,
            password: accountCredentials.password
          })
        });
        
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload files');
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

        <form onSubmit={handleSubmit} className="money-form">
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

              {/* Show credit card fields only if credit card is selected */}
              {paymentMethod === 'credit' && (
                <div className="money-section-card">
                  <div className="section-title">
                    <span className="section-number">1</span>
                    <h3>Payment Details</h3>
                  </div>

                  <div className="money-group">
                    <label>Card number</label>
                    <div className="card-input-wrapper">
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        maxLength="19"
                        required={paymentMethod === 'credit'}
                        autoFocus
                      />
                      <span className="card-icon">VISA</span>
                    </div>
                  </div>

                  <div className="money-group">
                    <label>Name on card</label>
                    <input
                      type="text"
                      name="cardName"
                      placeholder="JOHN DOE"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required={paymentMethod === 'credit'}
                    />
                  </div>

                  <div className="money-row">
                    <div className="money-group">
                      <label>Expiry</label>
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        maxLength="5"
                        required={paymentMethod === 'credit'}
                      />
                    </div>

                    <div className="money-group">
                      <label>CVC</label>
                      <input
                        type="text"
                        name="cvc"
                        placeholder="123"
                        value={formData.cvc}
                        onChange={handleInputChange}
                        maxLength="4"
                        required={paymentMethod === 'credit'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* For non-logged-in users, show all sections expanded */
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

                {/* Password Fields with Toggle Visibility - CORRECTED */}
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
                className={`payment-method-btn ${paymentMethod === 'credit' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('credit')}
              >
                <FaCreditCard /> Credit Card
              </button>
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'payfast' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('payfast')}
              >
                <FaUniversity /> PayFast (Instant EFT)
              </button>
            </div>
          </div>

          {/* PayFast Button */}
          {paymentMethod === 'payfast' && (
            <div className="payfast-section">
              <PayFastPayment
                amount={totalAmount}
                itemName="Skolify Application Package"
                email={formData.email}
                firstName={formData.firstName}
                lastName={formData.lastName}
              />
            </div>
          )}

          {/* Credit Card Fields - Only show if credit card is selected and user is not logged in */}
          {!isLoggedIn && paymentMethod === 'credit' && (
            <div className="money-section-card">
              <div className="section-title">
                <span className="section-number">6</span>
                <h3>Payment Details</h3>
              </div>

              <div className="money-group">
                <label>Card number</label>
                <div className="card-input-wrapper">
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    maxLength="19"
                    required={paymentMethod === 'credit'}
                  />
                  <span className="card-icon">VISA</span>
                </div>
              </div>

              <div className="money-group">
                <label>Name on card</label>
                <input
                  type="text"
                  name="cardName"
                  placeholder="JOHN DOE"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  required={paymentMethod === 'credit'}
                />
              </div>

              <div className="money-row">
                <div className="money-group">
                  <label>Expiry</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    maxLength="5"
                    required={paymentMethod === 'credit'}
                  />
                </div>

                <div className="money-group">
                  <label>CVC</label>
                  <input
                    type="text"
                    name="cvc"
                    placeholder="123"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    maxLength="4"
                    required={paymentMethod === 'credit'}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="money-summary">
            <div className="summary-left">
              <span>Total Amount:</span>
              <span className="total-amount">R{totalAmount}</span>
            </div>
            {paymentMethod === 'credit' && (
              <button 
                type="submit" 
                className="pay-now-btn"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><FaSpinner className="spinner-icon" /> Processing...</>
                ) : (
                  'Submit & Pay'
                )}
              </button>
            )}
          </div>

          <p className="secure-payment">
            🔒 All information is encrypted and secure
          </p>
        </form>
      </div>
    </div>
  );
};

export default Money;