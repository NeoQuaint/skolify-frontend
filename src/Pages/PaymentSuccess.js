import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import './PaymentResult.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  const transactionReference = searchParams.get('TransactionReference');
  const status = searchParams.get('Status');
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate]);
  
  return (
    <div className="payment-result-container">
      <div className="payment-result-card success">
        <div className="result-icon">
          <FaCheckCircle />
        </div>
        
        <h1>Payment Successful!</h1>
        
        <div className="result-message">
          <p>Thank you for your payment. Your transaction has been completed successfully.</p>
        </div>
        
        <div className="result-details">
          {transactionReference && (
            <div className="detail-row">
              <span className="detail-label">Transaction Reference:</span>
              <span className="detail-value">{transactionReference}</span>
            </div>
          )}
          
          {status && (
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="detail-value status-badge success">Completed</span>
            </div>
          )}
        </div>
        
        <div className="result-actions">
          <button 
            className="primary-btn"
            onClick={() => navigate('/profile')}
          >
            View My Applications
          </button>
          
          <button 
            className="secondary-btn"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="redirect-message">
          <FaSpinner className="spinner-icon" />
          <p>Redirecting to your profile in {countdown} seconds...</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;