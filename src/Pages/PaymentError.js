import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import './PaymentResult.css';

const PaymentError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  const transactionReference = searchParams.get('TransactionReference');
  const errorMessage = searchParams.get('ErrorMessage') || 'An error occurred during payment processing';
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/payment');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate]);
  
  return (
    <div className="payment-result-container">
      <div className="payment-result-card error">
        <div className="result-icon">
          <FaExclamationTriangle />
        </div>
        
        <h1>Payment Error</h1>
        
        <div className="result-message">
          <p>We encountered an error while processing your payment.</p>
          <p className="error-detail">{errorMessage}</p>
        </div>
        
        {transactionReference && (
          <div className="result-details">
            <div className="detail-row">
              <span className="detail-label">Transaction Reference:</span>
              <span className="detail-value">{transactionReference}</span>
            </div>
          </div>
        )}
        
        <div className="result-actions">
          <button 
            className="primary-btn"
            onClick={() => navigate('/payment')}
          >
            Try Again
          </button>
          
          <button 
            className="secondary-btn"
            onClick={() => navigate('/contact-support')}
          >
            Contact Support
          </button>
        </div>
        
        <div className="redirect-message">
          <FaSpinner className="spinner-icon" />
          <p>Redirecting to payment page in {countdown} seconds...</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;