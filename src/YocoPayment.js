import React, { useState } from 'react';
import API_URL from './config';

const YocoPayment = ({ amount, trackingNumber, description, customerEmail, customerName, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/yoco/create-payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount,
          trackingNumber: trackingNumber,
          description: description,
          customerEmail: customerEmail,
          customerName: customerName
        })
      });
      
      const data = await response.json();
      
      if (data.paymentLinkUrl) {
        // Redirect customer to Yoco's secure payment page
        window.location.href = data.paymentLinkUrl;
      } else {
        onError(data.error || 'Failed to create payment link');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment}
      disabled={isLoading}
      className="yoco-pay-btn"
      style={{
        width: '100%',
        padding: '14px',
        backgroundColor: '#2b6cb0',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1
      }}
    >
      {isLoading ? 'Creating payment link...' : `Pay R${amount}`}
    </button>
  );
};

export default YocoPayment;