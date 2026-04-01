import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import { 
  FaUser, FaEnvelope, FaPhone, FaUniversity, FaDownload, 
  FaEdit, FaSave, FaTimes, FaCheck, FaIdCard, FaGraduationCap, 
  FaReceipt, FaUpload, FaWhatsapp, FaVenusMars, FaGlobe, 
  FaLanguage, FaHome, FaUserTie, FaPhoneAlt, FaCalendarAlt,
  FaHistory, FaBoxOpen, FaHashtag, FaChevronDown, FaChevronUp,
  FaCreditCard, FaArrowLeft, FaSpinner, FaLock  // Added FaLock here
} from 'react-icons/fa';

// Import the PasswordChange component
import PasswordChange from './PasswordChange';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [paymentSelections, setPaymentSelections] = useState([]);
  const [documents, setDocuments] = useState({
    id: { name: null, uploaded: false, path: null },
    results: { name: null, uploaded: false, path: null }
  });
  const [error, setError] = useState(null);
  const [showOrders, setShowOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // NEW: State for password change modal
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        const isUserLoggedIn = !!(token && user);
        
        console.log('📊 ProfilePage - Loading data, logged in:', isUserLoggedIn);
        setIsLoggedIn(isUserLoggedIn);
        
        if (isUserLoggedIn && user) {
          const parsedUser = JSON.parse(user);
          setLoggedInUser(parsedUser);
          
          // Fetch user profile from database
          try {
            console.log('📡 Fetching user profile...');
            const response = await fetch('http://localhost:5000/api/user/profile', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            const data = await response.json();
            console.log('📥 Profile data:', data);
            
            if (data.success) {
              setProfileData(data.user);
              setEditedData(data.user);
              
              if (data.user.documents) {
                setDocuments({
                  id: { 
                    name: data.user.documents.id?.split('/').pop() || null, 
                    uploaded: !!data.user.documents.id,
                    path: data.user.documents.id || null
                  },
                  results: { 
                    name: data.user.documents.results?.split('/').pop() || null, 
                    uploaded: !!data.user.documents.results,
                    path: data.user.documents.results || null
                  }
                });
              }
            }
          } catch (error) {
            console.error('❌ Error fetching profile:', error);
          }
          
          // Fetch ALL payment selections
          try {
            console.log('📡 Fetching ALL payment selections...');
            const selectionResponse = await fetch('http://localhost:5000/api/payment/get-all-selections', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            const selectionData = await selectionResponse.json();
            console.log('📥 Payment selections response:', selectionData);
            
            if (selectionData.success && selectionData.selections && selectionData.selections.length > 0) {
              setPaymentSelections(selectionData.selections);
              console.log(`✅ Loaded ${selectionData.selections.length} payment selections`);
            } else {
              console.log('ℹ️ No payment selections found');
            }
          } catch (error) {
            console.error('❌ Error fetching payment selections:', error);
          }
          
          // Fetch ALL applications (for tracking numbers)
          try {
            console.log('📡 Fetching ALL applications...');
            const appsResponse = await fetch('http://localhost:5000/api/applications/all', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            const appsData = await appsResponse.json();
            console.log('📥 Applications response:', appsData);
            
            if (appsData.success && appsData.applications.length > 0) {
              setApplications(appsData.applications);
              console.log(`✅ Loaded ${appsData.applications.length} applications`);
              
              // Log all tracking numbers for debugging
              appsData.applications.forEach(app => {
                console.log(`📦 Application: ${app.tracking_number} - ${app.created_at}`);
              });
            }
          } catch (error) {
            console.error('❌ Error fetching applications:', error);
          }
        } else {
          // Not logged in - load from localStorage
          console.log('ℹ️ Not logged in, loading from localStorage');
          const savedSummary = localStorage.getItem('applicationSummary');
          if (savedSummary) {
            const summary = JSON.parse(savedSummary);
            setPaymentSelections([summary]);
          }
          
          const storedProfileData = localStorage.getItem('userProfileData');
          if (storedProfileData) {
            const data = JSON.parse(storedProfileData);
            setProfileData(data);
            setEditedData(data);
            
            if (data.documents) {
              setDocuments({
                id: { name: data.documents.id, uploaded: !!data.documents.id, path: null },
                results: { name: data.documents.results, uploaded: !!data.documents.results, path: null }
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in loadProfileData:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfileData();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedData(profileData);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setProfileData(editedData);
    localStorage.setItem('userProfileData', JSON.stringify(editedData));
    
    if (isLoggedIn) {
      const token = localStorage.getItem('authToken');
      try {
        await fetch('http://localhost:5000/api/applications/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(editedData)
        });
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
    
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = async (type, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append(type, file);
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/upload-documents', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        const filePath = result.paths[type];
        
        setDocuments(prev => ({
          ...prev,
          [type]: { 
            name: file.name, 
            uploaded: true, 
            path: filePath
          }
        }));
        
        // Update profile data with document path
        const updatedData = { ...profileData };
        if (!updatedData.documents) updatedData.documents = {};
        updatedData.documents[type] = filePath;
        
        // Save to localStorage
        localStorage.setItem('userProfileData', JSON.stringify(updatedData));
        setProfileData(updatedData);
        
        // If logged in, update in database
        if (isLoggedIn && token) {
          await fetch('http://localhost:5000/api/applications/update-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ documents: updatedData.documents })
          });
        }
        
        console.log(`✅ ${type} uploaded successfully:`, filePath);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError(`Failed to upload ${type}: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (type) => {
    const doc = documents[type];
    if (!doc || !doc.path) {
      alert('No file to download');
      return;
    }
    
    try {
      // For now, just show the file path
      alert(`File location: ${doc.path}`);
      
      // In production, you would serve the file:
      // window.open(`http://localhost:5000/${doc.path}`, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  // NEW: Handle successful password change
  const handlePasswordChangeSuccess = () => {
    console.log('✅ Password changed successfully');
    // You could show a toast notification here if you have one
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'processing': return 'status-processing';
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'selection saved': return 'status-saved';
      default: return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not available';
    const date = new Date(timestamp);
    return date.toLocaleString('en-ZA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  const getPackagePrice = (pkg) => {
    const prices = {
      basic: 169,
      standard: 329,
      premium: 499,
      custom: 'Custom'
    };
    return prices[pkg?.toLowerCase()] || prices.basic;
  };

  // Get tracking number directly from the order
  const getTrackingNumber = (order) => {
    if (order.trackingNumber) return order.trackingNumber;
    if (order.tracking_number) return order.tracking_number;
    
    if (applications.length > 0 && order.createdAt) {
      const orderDate = new Date(order.createdAt);
      
      const matchingApp = applications.find(app => {
        if (!app.tracking_number) return false;
        const appDate = new Date(app.created_at);
        const diffMinutes = Math.abs(appDate - orderDate) / (1000 * 60);
        return diffMinutes < 5;
      });
      
      if (matchingApp) return matchingApp.tracking_number;
    }
    
    return null;
  };

  // Toggle expanded order view
  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  if (isLoading) {
    return <div className="loading-state">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Error Loading Profile</h2>
        <p>{error}</p>
        <button className="back-to-dashboard" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!isLoggedIn && !profileData && paymentSelections.length === 0) {
    return (
      <div className="no-data-state">
        <h2>No Profile Data Found</h2>
        <p>Please sign in or complete an application first.</p>
        <button className="back-to-dashboard" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header fixed">
        <div className="header-content">
          <div className="logo">
            <img src="/SKOLIFY LOGO.jpeg" alt="Skolify Logo" className="logo-image" />
            <span className="logo-text">Skolify</span>
          </div>
          <button className="back-to-dashboard" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="profile-container">
        {/* Welcome banner */}
        {isLoggedIn && loggedInUser && (
          <div className="welcome-banner">
            <h2>Welcome back, {loggedInUser.firstName}!</h2>
            <p>Your profile and all your orders are shown below.</p>
          </div>
        )}

        {/* Orders Section with Toggle */}
        {paymentSelections.length > 0 && (
          <div className="orders-section">
            <div className="orders-header" onClick={() => setShowOrders(!showOrders)}>
              <div className="orders-header-left">
                <FaHistory className="orders-icon" />
                <h2>Your Orders ({paymentSelections.length})</h2>
              </div>
              <button className="orders-toggle-btn">
                {showOrders ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
            
            {showOrders && (
              <div className="orders-grid">
                {paymentSelections.map((order, index) => {
                  const orderId = order.id || `order-${index}`;
                  const isExpanded = expandedOrder === orderId;
                  const orderUniversities = order.universities || [];
                  const totalCourses = order.totalCourses || 
                    orderUniversities.reduce((sum, uni) => sum + (uni.courses?.length || 0), 0);
                  const trackingNumber = getTrackingNumber(order);
                  
                  console.log(`🏷️ Order ${index} tracking:`, trackingNumber, 'Order data:', order);
                  
                  return (
                    <div key={index} className="order-card">
                      <div className="order-card-header">
                        <div className="order-date-badge">
                          <FaCalendarAlt className="date-icon" />
                          <span>{formatDate(order.createdAt || order.timestamp || order.created_at)}</span>
                        </div>
                        {trackingNumber ? (
                          <div className="tracking-badge">
                            <FaHashtag className="tracking-icon" />
                            <span>{trackingNumber}</span>
                          </div>
                        ) : (
                          <div className="status-badge saved">Selection Saved</div>
                        )}
                      </div>
                      
                      <div className="order-card-body">
                        <div className="order-package-row">
                          <span className="package-tag">{order.package?.toUpperCase() || 'BASIC'}</span>
                          <span className="order-amount">R{order.totalCost || order.amount || getPackagePrice(order.package)}</span>
                        </div>
                        
                        <div className="order-stats-row">
                          <span className="stat-item">
                            <FaUniversity className="stat-icon" />
                            {orderUniversities.length} {orderUniversities.length === 1 ? 'University' : 'Universities'}
                          </span>
                          <span className="stat-item">
                            <FaGraduationCap className="stat-icon" />
                            {totalCourses} {totalCourses === 1 ? 'Course' : 'Courses'}
                          </span>
                        </div>
                        
                        {/* Show mini list when collapsed, full details when expanded */}
                        {!isExpanded ? (
                          <div className="universities-mini-list">
                            {orderUniversities.slice(0, 2).map((uni, idx) => (
                              <div key={idx} className="uni-mini-item">
                                <span className="uni-code">{uni.code}</span>
                                <span className="uni-courses-count">{uni.courses?.length || 0} courses</span>
                              </div>
                            ))}
                            {orderUniversities.length > 2 && (
                              <div className="more-unis">+{orderUniversities.length - 2} more</div>
                            )}
                          </div>
                        ) : (
                          <div className="universities-expanded-list">
                            {orderUniversities.map((uni, idx) => (
                              <div key={idx} className="uni-expanded-item">
                                <div className="uni-expanded-header">
                                  <FaUniversity className="uni-icon-small" />
                                  <span className="uni-expanded-name">{uni.name} ({uni.code})</span>
                                </div>
                                <div className="courses-expanded-list">
                                  {uni.courses && uni.courses.length > 0 ? (
                                    uni.courses.map((course, cidx) => (
                                      <div key={cidx} className="course-expanded-item">
                                        <span className="course-bullet">•</span>
                                        <span className="course-name">{course}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <span className="no-courses">No courses selected</span>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="expanded-total">
                              <strong>Total:</strong> {totalCourses} courses across {orderUniversities.length} universities
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="order-card-footer">
                        <button 
                          className="view-details-btn"
                          onClick={() => toggleOrderExpand(orderId)}
                        >
                          {isExpanded ? 'Show Less' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {paymentSelections.length === 0 && (
          <div className="no-applications-message">
            <FaBoxOpen className="no-applications-icon" />
            <p>No application data found. Please complete an application first.</p>
            <button className="create-order-btn" onClick={() => navigate('/dashboard')}>
              Create New Order
            </button>
          </div>
        )}

        {/* Profile Information Grid */}
        <div className="profile-grid">
          {/* Personal Information Card */}
          <div className="profile-card personal-card">
            <div className="card-header">
              <h2>Personal Information</h2>
              <button 
                className="edit-toggle-btn"
                onClick={handleEditToggle}
              >
                {isEditing ? <FaTimes /> : <FaEdit />}
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* NEW: Password Change Button - Only show for logged in users */}
            {isLoggedIn && (
              <div className="password-change-section">
                <button 
                  className="change-password-btn"
                  onClick={() => setShowPasswordChange(true)}
                >
                  <FaLock /> Change Password
                </button>
              </div>
            )}

            <div className="card-body">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label><FaUser /> First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editedData.first_name || editedData.firstName || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label><FaUser /> Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editedData.last_name || editedData.lastName || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label><FaIdCard /> ID Number</label>
                    <input
                      type="text"
                      name="idNumber"
                      value={editedData.id_number || editedData.idNumber || ''}
                      onChange={handleInputChange}
                      readOnly
                      className="readonly-field"
                    />
                  </div>
                  <div className="form-group">
                    <label><FaVenusMars /> Gender</label>
                    <select
                      name="gender"
                      value={editedData.gender || ''}
                      onChange={handleInputChange}
                      className="profile-select"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label><FaEnvelope /> Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editedData.email || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label><FaPhone /> Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={editedData.phone_number || editedData.phoneNumber || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label><FaWhatsapp /> WhatsApp</label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={editedData.whatsapp_number || editedData.whatsappNumber || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <button className="save-btn" onClick={handleSave} disabled={isUploading}>
                    <FaSave /> Save Changes
                  </button>
                </div>
              ) : (
                <div className="info-display">
                  <div className="info-row">
                    <FaUser className="info-icon" />
                    <div>
                      <span className="info-label">Full Name</span>
                      <span className="info-value">
                        {profileData?.first_name || profileData?.firstName || 'Not specified'} {profileData?.last_name || profileData?.lastName || ''}
                      </span>
                    </div>
                  </div>
                  <div className="info-row">
                    <FaIdCard className="info-icon" />
                    <div>
                      <span className="info-label">ID Number</span>
                      <span className="info-value">{profileData?.id_number || profileData?.idNumber || 'Not specified'}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <FaVenusMars className="info-icon" />
                    <div>
                      <span className="info-label">Gender</span>
                      <span className="info-value">{profileData?.gender || 'Not specified'}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <FaEnvelope className="info-icon" />
                    <div>
                      <span className="info-label">Email</span>
                      <span className="info-value">{profileData?.email || 'Not specified'}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <FaPhone className="info-icon" />
                    <div>
                      <span className="info-label">Phone</span>
                      <span className="info-value">{profileData?.phone_number || profileData?.phoneNumber || 'Not specified'}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <FaWhatsapp className="info-icon" />
                    <div>
                      <span className="info-label">WhatsApp</span>
                      <span className="info-value">{profileData?.whatsapp_number || profileData?.whatsappNumber || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address & Demographics Card */}
          <div className="profile-card address-card">
            <div className="card-header">
              <h2>Address & Demographics</h2>
            </div>
            <div className="card-body">
              <div className="info-display">
                <div className="info-row">
                  <FaHome className="info-icon" />
                  <div>
                    <span className="info-label">Province</span>
                    <span className="info-value">{profileData?.province || 'Not specified'}</span>
                  </div>
                </div>
                <div className="info-row">
                  <FaHome className="info-icon" />
                  <div>
                    <span className="info-label">City/Town</span>
                    <span className="info-value">{profileData?.city || 'Not specified'}</span>
                  </div>
                </div>
                <div className="info-row">
                  <FaLanguage className="info-icon" />
                  <div>
                    <span className="info-label">Home Language</span>
                    <span className="info-value">{profileData?.home_language || profileData?.homeLanguage || 'Not specified'}</span>
                  </div>
                </div>
                <div className="info-row">
                  <FaGlobe className="info-icon" />
                  <div>
                    <span className="info-label">Nationality</span>
                    <span className="info-value">{profileData?.nationality || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next of Kin Card */}
          <div className="profile-card kin-card">
            <div className="card-header">
              <h2>Next of Kin</h2>
            </div>
            <div className="card-body">
              <div className="info-display">
                <div className="info-row">
                  <FaUserTie className="info-icon" />
                  <div>
                    <span className="info-label">Name</span>
                    <span className="info-value">{profileData?.kin_name || profileData?.kinName || 'Not specified'}</span>
                  </div>
                </div>
                <div className="info-row">
                  <FaPhoneAlt className="info-icon" />
                  <div>
                    <span className="info-label">Phone</span>
                    <span className="info-value">{profileData?.kin_phone || profileData?.kinPhone || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Card */}
          <div className="profile-card documents-card">
            <div className="card-header">
              <h2>Uploaded Documents</h2>
              {isUploading && <FaSpinner className="upload-spinner" />}
            </div>
            <div className="card-body">
              <div className="document-upload-list">
                {/* ID Document */}
                <div className="document-item">
                  <div className="document-info">
                    <FaIdCard className="document-icon" />
                    <div>
                      <span className="document-name">ID Document</span>
                      {documents.id.uploaded ? (
                        <span className="uploaded-badge">
                          <FaCheck /> {documents.id.name}
                        </span>
                      ) : (
                        <span className="pending-badge">Not uploaded</span>
                      )}
                    </div>
                  </div>
                  <div className="document-actions">
                    {documents.id.uploaded ? (
                      <>
                        <button className="download-btn" onClick={() => handleDownload('id')} disabled={isUploading}>
                          <FaDownload />
                        </button>
                        <label className={`replace-btn ${isUploading ? 'disabled' : ''}`}>
                          Replace
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload('id', e)}
                            disabled={isUploading}
                            hidden
                          />
                        </label>
                      </>
                    ) : (
                      <label className={`upload-btn ${isUploading ? 'disabled' : ''}`}>
                        {isUploading ? 'Uploading...' : <><FaUpload /> Upload</>}
                        <input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('id', e)}
                          disabled={isUploading}
                          hidden
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Matric/Results */}
                <div className="document-item">
                  <div className="document-info">
                    <FaGraduationCap className="document-icon" />
                    <div>
                      <span className="document-name">Matric/Grade 11 Results</span>
                      {documents.results.uploaded ? (
                        <span className="uploaded-badge">
                          <FaCheck /> {documents.results.name}
                        </span>
                      ) : (
                        <span className="pending-badge">Not uploaded</span>
                      )}
                    </div>
                  </div>
                  <div className="document-actions">
                    {documents.results.uploaded ? (
                      <>
                        <button className="download-btn" onClick={() => handleDownload('results')} disabled={isUploading}>
                          <FaDownload />
                        </button>
                        <label className={`replace-btn ${isUploading ? 'disabled' : ''}`}>
                          Replace
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload('results', e)}
                            disabled={isUploading}
                            hidden
                          />
                        </label>
                      </>
                    ) : (
                      <label className={`upload-btn ${isUploading ? 'disabled' : ''}`}>
                        {isUploading ? 'Uploading...' : <><FaUpload /> Upload</>}
                        <input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('results', e)}
                          disabled={isUploading}
                          hidden
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="documents-note">
                <p>✓ Documents uploaded are saved to your profile</p>
                <p className="small-note">Accepted formats: PDF, JPG, PNG</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <PasswordChange 
          onClose={() => setShowPasswordChange(false)}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </div>
  );
};

export default ProfilePage;