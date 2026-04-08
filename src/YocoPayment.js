import React, { useState } from 'react';
import { usePopup, useEFT } from '@lekkercommerce/yoco-react';

const YocoPayment = ({ amount, trackingNumber, paymentMethod, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const yocoPublicKey = process.env.REACT_APP_YOCO_PUBLIC_KEY;
  const [showPopup, isYocoReady] = usePopup(yocoPublicKey);
  const [showEFT, isEFTReady] = useEFT(yocoPublicKey);

  const handleCardPayment = async () => {
    if (!isYocoReady) {
      onError('Payment system is initializing. Please try again.');
      return;
    }
    
    if (!trackingNumber) {
      onError('Missing tracking number. Please refresh and try again.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await showPopup({
        amountInCents: Math.round(amount * 100),
        currency: 'ZAR',
        name: 'Skolify Application Fee',
        description: `Order ${trackingNumber}`,
        metadata: { 
          tracking_number: trackingNumber,
          amount: amount,
          timestamp: new Date().toISOString()
        },
        callback: async (result) => {
          if (result.error) {
            console.error('Yoco payment error:', result.error);
            onError(result.error.message || 'Payment failed. Please try again.');
          } else if (result.status === 'succeeded') {
            console.log('✅ Payment succeeded:', result.id);
            // Pass the transaction ID back to Money.js
            onSuccess(result.id);
          } else {
            console.warn('Unexpected payment result:', result);
            onError('Payment status unknown. Please contact support.');
          }
          setIsLoading(false);
        },
        onClose: () => {
          console.log('Yoco popup closed by user');
          setIsLoading(false);
          onError('Payment window closed before completion.');
        }
      });
    } catch (error) {
      console.error('Card payment error:', error);
      onError(error.message || 'Failed to initialize payment. Please try again.');
      setIsLoading(false);
    }
  };

  const handleEFTPayment = async () => {
    if (!isEFTReady) {
      onError('EFT system is initializing. Please try again.');
      return;
    }
    
    if (!trackingNumber) {
      onError('Missing tracking number. Please refresh and try again.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await showEFT({
        amountInCents: Math.round(amount * 100),
        currency: 'ZAR',
        name: 'Skolify Application Fee',
        description: `Order ${trackingNumber}`,
        metadata: { 
          tracking_number: trackingNumber,
          amount: amount,
          timestamp: new Date().toISOString()
        },
        callback: async (result) => {
          if (result.error) {
            console.error('EFT payment error:', result.error);
            onError(result.error.message || 'EFT payment failed. Please try again.');
          } else if (result.status === 'succeeded') {
            console.log('✅ EFT payment succeeded:', result.id);
            onSuccess(result.id);
          } else {
            console.warn('Unexpected EFT result:', result);
            onError('Payment status unknown. Please contact support.');
          }
          setIsLoading(false);
        },
        onClose: () => {
          console.log('EFT popup closed by user');
          setIsLoading(false);
          onError('EFT window closed before completion.');
        }
      });
    } catch (error) {
      console.error('EFT payment error:', error);
      onError(error.message || 'Failed to initialize EFT. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'card') {
      handleCardPayment();
    } else if (paymentMethod === 'eft') {
      handleEFTPayment();
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    if (paymentMethod === 'card') return `Pay R${amount.toFixed(2)} with Card`;
    return `Pay R${amount.toFixed(2)} with EFT`;
  };

  const isDisabled = isLoading || (paymentMethod === 'card' ? !isYocoReady : !isEFTReady) || !trackingNumber;

  return (
    <button 
      onClick={handlePayment}
      disabled={isDisabled}
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
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.7 : 1,
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = '#2c5282';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = '#2b6cb0';
        }
      }}
    >
      {isLoading ? (
        <>
          <span className="spinner" style={{ 
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid white',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginRight: '8px'
          }}></span>
          Processing...
        </>
      ) : (
        getButtonText()
      )}
    </button>
  );
};

export default YocoPayment;