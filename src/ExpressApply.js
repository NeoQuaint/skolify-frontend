// src/pages/ExpressApply.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExpressApply.css';
import { 
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaGraduationCap,
  FaUpload, FaCheck, FaSpinner, FaLightbulb, FaSchool,
  FaMapMarkerAlt, FaCalendarAlt, FaHome, FaCity, FaBuilding,
  FaArrowLeft
} from 'react-icons/fa';
import API_URL from './config';

const ExpressApply = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [needsHelp, setNeedsHelp] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idNumber: '',
    previousSchool: '',
    previousSchoolProvince: '',
    previousSchoolYear: '',
    province: '',
    city: ''
  });

  const [resultsFile, setResultsFile] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
      setError('Please fill in all required fields');
      return;
    }

    if (!resultsFile) {
      setError('Please upload your matric results');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      
      // Upload results file
      const fileFormData = new FormData();
      fileFormData.append('results', resultsFile);
      
      const uploadRes = await fetch(`${API_URL}/api/upload-documents`, {
        method: 'POST',
        body: fileFormData
      });
      
      const uploadResult = await uploadRes.json();
      if (!uploadResult.success) throw new Error('File upload failed');
      
      // Save application
      const trackingNumber = `SKL-${Date.now().toString(36).toUpperCase()}`;
      
      const appRes = await fetch(`${API_URL}/api/applications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          idNumber: formData.idNumber,
          province: formData.province,
          city: formData.city,
          previousSchool: formData.previousSchool,
          previousSchoolProvince: formData.previousSchoolProvince,
          previousSchoolYear: formData.previousSchoolYear,
          documents: { results: uploadResult.paths?.results || null }
        })
      });
      
      if (!appRes.ok) throw new Error('Application save failed');
      
      // Save SmartClass lead if needed
      if (needsHelp) {
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
            previousSchool: formData.previousSchool,
            previousSchoolYear: formData.previousSchoolYear
          })
        });
      }
      
      // Track event
      await fetch(`${API_URL}/api/track-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventType: 'express_apply_submitted',
          eventData: { email: formData.email, needsHelp, isUpgrading }
        })
      });
      
      setIsSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="express-apply-page">
        <div className="express-container">
          <div className="express-success">
            <div className="success-icon">✅</div>
            <h2>Application Received!</h2>
            <p>We'll review your results and WhatsApp you within 24 hours with the courses you qualify for.</p>
            <p className="success-whatsapp">Make sure you're available on WhatsApp at <strong>{formData.phoneNumber}</strong></p>
            <button className="express-btn" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="express-apply-page">
      <div className="express-container">
        <button className="express-back" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back
        </button>

        <div className="express-hero">
          <h1>Apply to University — We'll Handle the Rest</h1>
          <p>Fill in your details below and upload your results. We'll find the courses you qualify for and submit your applications.</p>
          <div className="express-trust">
            <span>✅ 30,000+ students helped</span>
            <span>✅ 10+ universities</span>
            <span>✅ Response within 24 hours</span>
          </div>
        </div>

        {error && <div className="express-error">{error}</div>}

        <form onSubmit={handleSubmit} className="express-form">
          <div className="express-row">
            <div className="express-group">
              <label><FaUser /> First Name *</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required />
            </div>
            <div className="express-group">
              <label><FaUser /> Last Name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
            </div>
          </div>

          <div className="express-group">
            <label><FaEnvelope /> Email Address *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
          </div>

          <div className="express-group">
            <label><FaPhone /> Phone Number (WhatsApp) *</label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+27 81 234 5678" required />
            <small>We'll WhatsApp you your course options</small>
          </div>

          <div className="express-group">
            <label><FaIdCard /> ID Number</label>
            <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="000101 5084 089" />
          </div>

          <div className="express-row">
            <div className="express-group">
              <label><FaCity /> City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Johannesburg" />
            </div>
            <div className="express-group">
              <label><FaMapMarkerAlt /> Province</label>
              <select name="province" value={formData.province} onChange={handleChange} className="express-select">
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

          <div className="express-section-title">
            <FaSchool /> Previous School
          </div>

          <div className="express-group">
            <label>School Name</label>
            <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleChange} placeholder="Parktown High School" />
          </div>

          <div className="express-row">
            <div className="express-group">
              <label>School Province</label>
              <select name="previousSchoolProvince" value={formData.previousSchoolProvince} onChange={handleChange} className="express-select">
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
            <div className="express-group">
              <label><FaCalendarAlt /> Year Completed</label>
              <input type="text" name="previousSchoolYear" value={formData.previousSchoolYear} onChange={handleChange} placeholder="2024" />
            </div>
          </div>

          <div className="express-section-title">
            <FaGraduationCap /> Upload Your Results *
          </div>

          <div className="express-upload">
            {resultsFile ? (
              <div className="express-file-selected">
                <FaCheck className="file-check" />
                <span>{resultsFile.name}</span>
                <button type="button" onClick={() => setResultsFile(null)}>Change</button>
              </div>
            ) : (
              <label className="express-upload-btn">
                <FaUpload /> Choose File (PDF or Image)
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setResultsFile(e.target.files[0])}
                  hidden
                />
              </label>
            )}
            <small>Upload your matric statement or Grade 11 results</small>
          </div>

          {/* SmartClass Lead Capture */}
          <div className="express-checkboxes">
            <label className="express-checkbox">
              <input type="checkbox" checked={isUpgrading} onChange={(e) => setIsUpgrading(e.target.checked)} />
              <span>I'm currently upgrading my marks</span>
            </label>
            <label className="express-checkbox">
              <input type="checkbox" checked={needsHelp} onChange={(e) => setNeedsHelp(e.target.checked)} />
              <span>I need help with my studies</span>
            </label>
          </div>

          {needsHelp && (
            <div className="express-smartclass-note">
              <FaLightbulb /> We'll connect you with a tutor through <strong>SmartClass</strong> — our virtual tutoring platform.
            </div>
          )}

          <button type="submit" className="express-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? <><FaSpinner className="spinner" /> Submitting...</> : 'Submit — We\'ll Handle the Rest'}
          </button>

          <p className="express-disclaimer">
            We'll WhatsApp you within 24 hours with the courses you qualify for. No payment required upfront.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ExpressApply;