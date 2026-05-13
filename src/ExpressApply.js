// src/ExpressApply.js
import React, { useState } from 'react';
import './Money.css';
import './ExpressApply.css';
import { 
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaGraduationCap, 
  FaUpload, FaCheck, FaSpinner, FaHome, FaUserTie, FaPhoneAlt, FaWhatsapp,
  FaSchool, FaMapMarkerAlt, FaCity, FaBuilding, FaCalendarAlt
} from 'react-icons/fa';
import API_URL from './config';

const ExpressApply = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ id: '', results: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('premium');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [needsHelp, setNeedsHelp] = useState(false);
  
  const packagePrices = { basic: 169, standard: 329, premium: 499 };
  const packageLimits = { basic: 2, standard: 4, premium: 6 };
  
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
      
      if (result.success) {
        setDocuments(prev => ({
          ...prev,
          [type]: { 
            name: file.name, 
            uploaded: true, 
            file: file, 
            path: result.paths[type] 
          }
        }));
      } else {
        setFieldErrors(prev => ({ 
          ...prev, 
          [type]: result.error || 'Upload failed' 
        }));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setFieldErrors(prev => ({ 
        ...prev, 
        [type]: 'Upload failed. Please try again.' 
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
      setError('Please fill in all required fields (Name, Email, Phone)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/express/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          selectedPackage,
          isUpgrading,
          needsHelp,
          documents: {
            id: documents.id.path || null,
            results: documents.results.path || null
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('expressId', data.expressId);
        localStorage.setItem('expressEmail', data.email);
        localStorage.setItem('expressTracking', data.trackingNumber);
        
        setIsSuccess(true);
        
        setTimeout(() => {
          if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
          }
        }, 2000);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Express apply error:', err);
      setError('Network error. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="express-page">
        <div className="express-container">
          <div className="express-success-card">
            <FaCheck className="express-success-icon" />
            <h2>Application Submitted!</h2>
            <p>We'll WhatsApp you at <strong>{formData.phoneNumber}</strong> with your course options within 24 hours.</p>
            <p style={{ marginTop: '12px', fontSize: '14px', color: '#64748b' }}>
              Redirecting to payment page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="express-page">
      <div className="express-container">
  <div className="express-logo-row">
  <img src="/Skolify-Logo.jpeg" alt="Skolify" className="express-logo" />
</div>
<div className="express-sticky-row">
  <img src="/SN.png" alt="Sticky Note" className="express-sticky-note" />
</div>

        <div className="express-heading">
          <h1>Fill Form</h1>
          <p className="express-subtitle">Stuck on your application? Hand it over.</p>
        </div>

        {error && <div className="money-error">{error}</div>}

        <form onSubmit={handleSubmit} className="money-form">
          {/* Section 1: Personal Information */}
          <div className="money-section-card">
            <div className="section-title">
              <span className="section-number">1</span>
              <h3>Personal Information</h3>
            </div>
            
            <div className="money-row">
              <div className="money-group">
                <label><FaUser /> First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" required />
              </div>
              <div className="money-group">
                <label>Middle Name</label>
                <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder="Michael (optional)" />
              </div>
            </div>

            <div className="money-group">
              <label><FaUser /> Last Name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" required />
            </div>

            <div className="money-group">
              <label><FaIdCard /> ID / Passport Number</label>
              <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} placeholder="000101 5084 089" />
            </div>

            <div className="money-row">
              <div className="money-group">
                <label>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
              </div>
              <div className="money-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="money-select">
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
                <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} placeholder="South African" />
              </div>
              <div className="money-group">
                <label>Home Language</label>
                <input type="text" name="homeLanguage" value={formData.homeLanguage} onChange={handleInputChange} placeholder="English / IsiZulu" />
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
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required />
            </div>

            <div className="money-row">
              <div className="money-group">
                <label><FaPhone /> Phone Number *</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="+27 11 123 4567" required />
              </div>
              <div className="money-group">
                <label><FaWhatsapp /> WhatsApp Number</label>
                <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} placeholder="+27 11 123 4567" />
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
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main Street" />
            </div>

            <div className="money-group">
              <label><FaBuilding /> Suburb / Area</label>
              <input type="text" name="suburb" value={formData.suburb} onChange={handleInputChange} placeholder="Sandton" />
            </div>

            <div className="money-row">
              <div className="money-group">
                <label><FaCity /> City / Town</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Johannesburg" />
              </div>
              <div className="money-group">
                <label><FaMapMarkerAlt /> Province</label>
                <select name="province" value={formData.province} onChange={handleInputChange} className="money-select">
                  <option value="">Select</option>
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
              <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="2000" />
            </div>
          </div>

          {/* Section 4: Previous School */}
          <div className="money-section-card">
            <div className="section-title">
              <span className="section-number">4</span>
              <h3>Previous School Attended</h3>
            </div>
            
            <div className="money-group">
              <label><FaSchool /> School Name</label>
              <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleInputChange} placeholder="Parktown High School" />
            </div>

            <div className="money-row">
              <div className="money-group">
                <label><FaMapMarkerAlt /> School Province</label>
                <select name="previousSchoolProvince" value={formData.previousSchoolProvince} onChange={handleInputChange} className="money-select">
                  <option value="">Select</option>
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
                <label><FaCalendarAlt /> Year Completed</label>
                <input type="text" name="previousSchoolYear" value={formData.previousSchoolYear} onChange={handleInputChange} placeholder="2024" />
              </div>
            </div>

            <div className="smartclass-lead-section">
              <div className="smartclass-checkbox-row">
                <label className="checkbox-label">
                  <input type="checkbox" checked={isUpgrading} onChange={(e) => setIsUpgrading(e.target.checked)} />
                  <span>Are you currently upgrading your marks?</span>
                </label>
              </div>
              <div className="smartclass-checkbox-row">
                <label className="checkbox-label">
                  <input type="checkbox" checked={needsHelp} onChange={(e) => setNeedsHelp(e.target.checked)} />
                  <span>Do you need help with your studies?</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 5: Next of Kin */}
          <div className="money-section-card">
            <div className="section-title">
              <span className="section-number">5</span>
              <h3>Next of Kin / Emergency Contact</h3>
            </div>
            
            <div className="money-group">
              <label><FaUserTie /> Full Name</label>
              <input type="text" name="kinName" value={formData.kinName} onChange={handleInputChange} placeholder="Jane Doe" />
            </div>

            <div className="money-row">
              <div className="money-group">
                <label><FaIdCard /> ID Number</label>
                <input type="text" name="kinIdNumber" value={formData.kinIdNumber} onChange={handleInputChange} placeholder="800505 0187 085" />
              </div>
              <div className="money-group">
                <label>Gender</label>
                <select name="kinGender" value={formData.kinGender} onChange={handleInputChange} className="money-select">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="money-group">
              <label>Relationship</label>
              <select name="kinRelationship" value={formData.kinRelationship} onChange={handleInputChange} className="money-select">
                <option value="">Select</option>
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
                <input type="tel" name="kinPhone" value={formData.kinPhone} onChange={handleInputChange} placeholder="+27 11 123 4567" />
              </div>
              <div className="money-group">
                <label><FaEnvelope /> Email</label>
                <input type="email" name="kinEmail" value={formData.kinEmail} onChange={handleInputChange} placeholder="jane@example.com" />
              </div>
            </div>
          </div>

          {/* Section 6: Package Selection */}
          <div className="money-section-card">
            <div className="section-title">
              <span className="section-number">6</span>
              <h3>How many universities?</h3>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
              {['basic', 'standard', 'premium'].map(pkg => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => setSelectedPackage(pkg)}
                  style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    border: selectedPackage === pkg ? '3px solid #ffc107' : '2px solid #e0e0e0',
                    background: selectedPackage === pkg ? '#ffc107' : 'white',
                    fontSize: '20px', fontWeight: 700, cursor: 'pointer',
                    color: '#1a1a1a', fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    transform: selectedPackage === pkg ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {packageLimits[pkg]}
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
              R{packagePrices[selectedPackage]} — {packageLimits[selectedPackage]} Universities
            </div>
          </div>

          {/* Section 7: Documents */}
          <div className="money-section-card">
            <div className="section-title">
              <span className="section-number">7</span>
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
                    <FaUpload /> Upload
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload('id', e)} disabled={isUploading} hidden />
                  </label>
                ) : (
                  <div className="uploaded-file">
                    <FaCheck className="uploaded-icon" />
                    <span>{documents.id.name}</span>
                    <button type="button" className="change-file-btn" onClick={() => setDocuments(prev => ({...prev, id: { name: null, uploaded: false, file: null, path: null }}))}>Change</button>
                  </div>
                )}
              </div>
              {fieldErrors.id && <div className="field-error">{fieldErrors.id}</div>}
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
                    <FaUpload /> Upload
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload('results', e)} disabled={isUploading} hidden />
                  </label>
                ) : (
                  <div className="uploaded-file">
                    <FaCheck className="uploaded-icon" />
                    <span>{documents.results.name}</span>
                    <button type="button" className="change-file-btn" onClick={() => setDocuments(prev => ({...prev, results: { name: null, uploaded: false, file: null, path: null }}))}>Change</button>
                  </div>
                )}
              </div>
              {fieldErrors.results && <div className="field-error">{fieldErrors.results}</div>}
            </div>
          </div>

          <button 
            type="submit" 
            className="pay-now-btn" 
            style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '8px' }} 
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? (
              <><FaSpinner className="spinner-icon" /> Submitting...</>
            ) : isUploading ? (
              <><FaSpinner className="spinner-icon" /> Uploading documents...</>
            ) : (
              'Submit Application'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpressApply;