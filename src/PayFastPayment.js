import React, { useState } from 'react';
import { FaUniversity, FaSpinner } from 'react-icons/fa';

const PayFastPayment = ({ amount, itemName, email, firstName, lastName }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const generatePayFastForm = () => {
    setIsProcessing(true);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://sandbox.payfast.co.za/eng/process';
    form.style.display = 'none';

    const transactionId = `SKL-${Date.now()}`;

    const fields = {
      merchant_id: '34276083',
      merchant_key: '4ufcxpw5ungke',
      return_url: `${window.location.origin}/payment/success`,
      cancel_url: `${window.location.origin}/payment/cancel`,
      notify_url: `${window.location.origin}/api/payfast/notify`,
      name_first: firstName,
      name_last: lastName,
      email_address: email,
      m_payment_id: transactionId,
      amount: amount.toFixed(2),
      item_name: itemName || 'Skolify University Application Package',
      item_description: 'University application processing fee',
      custom_str1: transactionId
    };

    Object.keys(fields).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="payfast-section">
      <button 
        onClick={generatePayFastForm}
        className="payfast-btn"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <><FaSpinner className="spinner-icon" /> Redirecting to PayFast...</>
        ) : (
          <>Pay R{amount} with PayFast</>
        )}
      </button>
    </div>
  );
};

// ✅ THIS IS CRUCIAL - Make sure you have this line
export default PayFastPayment;