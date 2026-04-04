import React, { useState } from 'react';
import { usePopup, useEFT } from '@lekkercommerce/yoco-react';
import API_URL from '../config';

const YocoPayment = ({ amount, trackingNumber, paymentMethod, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Get Yoco public key from environment variables
  const yocoPublicKey = process.env.REACT_APP_YOCO_PUBLIC_KEY;
  
  // Card payment hook
  const [showPopup, isYocoReady] = usePopup(yocoPublicKey);
  
  // EFT payment hook
  const [showEFT, isEFTReady] = useEFT(yocoPublicKey);

  const handleCardPayment = async () => {
    if (!isYocoReady) {
      onError('Payment system is initializing. Please try again.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, save the order to get a payment ID
      const orderResponse = await fetch(`${API_URL}/api/create-payment-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          trackingNumber: trackingNumber,
          paymentMethod: 'card'
        })
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderData.paymentId) {
        throw new Error('Failed to create payment session');
      }
      
      // Show Yoco card popup
      await showPopup({
        amountInCents: Math.round(amount * 100),
        currency: 'ZAR',
        paymentId: orderData.paymentId,
        name: 'Skolify Application Fee',
        description: `Order ${trackingNumber}`,
        callback: async (result) => {
          if (result.error) {
            onError(result.error.message);
          } else if (result.status === 'succeeded') {
            // Payment successful - verify with backend
            await verifyPayment(result.id, trackingNumber);
            onSuccess(result.id);
          }
        },
        onClose: () => {
          setIsLoading(false);
          onError('Payment window closed');
        }
      });
    } catch (error) {
      console.error('Card payment error:', error);
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEFTPayment = async () => {
    if (!isEFTReady) {
      onError('EFT system is initializing. Please try again.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, save the order to get a payment ID
      const orderResponse = await fetch(`${API_URL}/api/create-payment-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          trackingNumber: trackingNumber,
          paymentMethod: 'eft'
        })
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderData.paymentId) {
        throw new Error('Failed to create payment session');
      }
      
      // Show Yoco EFT popup
      await showEFT({
        amountInCents: Math.round(amount * 100),
        currency: 'ZAR',
        paymentId: orderData.paymentId,
        name: 'Skolify Application Fee',
        description: `Order ${trackingNumber}`,
        callback: async (result) => {
          if (result.error) {
            onError(result.error.message);
          } else if (result.status === 'succeeded') {
            await verifyPayment(result.id, trackingNumber);
            onSuccess(result.id);
          }
        },
        onClose: () => {
          setIsLoading(false);
          onError('EFT window closed');
        }
      });
    } catch (error) {
      console.error('EFT payment error:', error);
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (chargeId, trackingNum) => {
    try {
      const response = await fetch(`${API_URL}/api/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chargeId: chargeId,
          trackingNumber: trackingNum
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to success page
        window.location.href = `/payment-success?tracking=${trackingNum}`;
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      onError(error.message);
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
    if (paymentMethod === 'card') return `Pay R${amount} with Card`;
    return `Pay R${amount} with EFT`;
  };

  return (
    <button 
      onClick={handlePayment}
      disabled={isLoading || (paymentMethod === 'card' ? !isYocoReady : !isEFTReady)}
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
        cursor: (isLoading || (paymentMethod === 'card' ? !isYocoReady : !isEFTReady)) ? 'not-allowed' : 'pointer',
        opacity: (isLoading || (paymentMethod === 'card' ? !isYocoReady : !isEFTReady)) ? 0.7 : 1
      }}
    >
      {getButtonText()}
    </button>
  );
};

export default YocoPayment;