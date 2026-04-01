import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaTimesCircle, FaSpinner } from 'react-icons/fa';
import './PaymentResult.css';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  const transactionReference = searchParams.get('TransactionReference');
  
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
      <div className="payment-result-card cancelled">
        <div className="result-icon">
          <FaTimesCircle />
        </div>
        
        <h1>Payment Cancelled</h1>
        
        <div className="result-message">
          <p>Your payment was cancelled. No charges have been made to your account.</p>
          <p>You can try again whenever you're ready.</p>
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
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
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

export default PaymentCancel;