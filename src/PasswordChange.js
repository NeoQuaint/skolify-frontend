import React, { useState } from 'react';
import { FaTimes, FaCheck, FaSpinner, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import './PasswordChange.css';
import API_URL from './config';

const PasswordChange = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Cap at 3 for display (weak, medium, strong)
    if (strength <= 2) return 1; // weak
    if (strength <= 4) return 2; // medium
    return 3; // strong
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Check password strength
    if (name === 'newPassword') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 2000);
      } else {
        setApiError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setApiError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get strength text and color
  const getStrengthInfo = () => {
    switch(passwordStrength) {
      case 1: return { text: 'Weak', class: 'weak' };
      case 2: return { text: 'Medium', class: 'medium' };
      case 3: return { text: 'Strong', class: 'strong' };
      default: return { text: '', class: '' };
    }
  };

  const strengthInfo = getStrengthInfo();

  return (
    <div className="password-change-overlay" onClick={onClose}>
      <div className="password-change-modal" onClick={e => e.stopPropagation()}>
        <div className="password-change-header">
          <h2>Change Password</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="password-change-body">
          <div className="info-box">
            <p><FaLock /> Security Tip</p>
            <p>Choose a strong password that you don't use on other sites.</p>
            <p>Your password will be encrypted and securely stored.</p>
          </div>

          {success && (
            <div className="success-message">
              <FaCheck /> Password changed successfully! Redirecting...
            </div>
          )}

          {apiError && (
            <div className="error-message">
              <FaExclamationTriangle /> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={errors.currentPassword ? 'error' : ''}
                placeholder="Enter your current password"
                disabled={isLoading || success}
              />
              {errors.currentPassword && (
                <small className="error-text">{errors.currentPassword}</small>
              )}
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? 'error' : ''}
                placeholder="Enter new password (min 6 characters)"
                disabled={isLoading || success}
              />
              {formData.newPassword && (
                <>
                  <div className="password-strength">
                    <div 
                      className={`strength-bar ${strengthInfo.class}`}
                      style={{ width: `${(passwordStrength / 3) * 100}%` }}
                    ></div>
                  </div>
                  <div className={`strength-text ${strengthInfo.class}`}>
                    Password strength: {strengthInfo.text}
                  </div>
                </>
              )}
              {errors.newPassword && (
                <small className="error-text">{errors.newPassword}</small>
              )}
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Re-enter your new password"
                disabled={isLoading || success}
              />
              {errors.confirmPassword && (
                <small className="error-text">{errors.confirmPassword}</small>
              )}
            </div>

            <div className="password-requirements">
              <p>Password requirements:</p>
              <ul>
                <li className={formData.newPassword.length >= 6 ? 'valid' : 'invalid'}>
                  {formData.newPassword.length >= 6 ? <FaCheck /> : '•'} At least 6 characters
                </li>
                <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : 'invalid'}>
                  {/[A-Z]/.test(formData.newPassword) ? <FaCheck /> : '•'} At least one uppercase letter
                </li>
                <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : 'invalid'}>
                  {/[0-9]/.test(formData.newPassword) ? <FaCheck /> : '•'} At least one number
                </li>
              </ul>
            </div>
          </form>
        </div>

        <div className="password-change-footer">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={isLoading || success}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spinner-icon" /> Changing...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordChange;