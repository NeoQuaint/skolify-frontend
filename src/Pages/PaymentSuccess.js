import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import './PaymentResult.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  
  const transactionReference = searchParams.get('TransactionReference');
  const status = searchParams.get('Status');
  
  useEffect(() => {
    // Mark R19 as paid immediately
    localStorage.setItem('r19_paid', 'true');
    localStorage.removeItem('r19_payment_pending');
    localStorage.removeItem('r19_checkout_id');
    
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
      <div className="payment-result-card success">
        <div className="result-icon">
          <FaCheckCircle />
        </div>
        
        <h1>Payment Successful!</h1>
        
        <div className="result-message">
          <p>Your payment was successful. Returning to your results...</p>
        </div>
        
        <div className="result-actions">
          <button 
            className="primary-btn"
            onClick={() => navigate('/payment')}
          >
            View My Results
          </button>
        </div>
        
        <div className="redirect-message">
          <FaSpinner className="spinner-icon" />
          <p>Redirecting in {countdown} seconds...</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;