import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useWizardStore } from '../stores/wizardStore';
import GlowingBox from './GlowingBox.jsx';
import PiSymbol from './PiSymbol.jsx';

export default function PaymentForm({ onSuccess }) {
  const { paymentStatus, updateField } = useWizardStore();

  useEffect(() => {
    // Initialize Pi SDK for sandbox environment
    window.Pi.init({
      version: '2.0',
      sandbox: true, // Use sandbox for local development
    });

    // Create payment
    window.Pi.createPayment(
      {
        amount: 74.99, // App fee
        memo: 'Death and Taxes Filing Fee',
        metadata: { userId: 'user_id_here' }, // Replace with actual user ID from authStore
      },
      {
        onReadyForServerApproval: (paymentId) => {
          console.log('Payment ready:', paymentId);
          // Call backend to approve payment
          updateField('paymentStatus', 'Approved');
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          console.log('Payment completed:', paymentId, txid);
          updateField('paymentStatus', 'Completed');
          onSuccess();
        },
        onCancel: () => {
          console.log('Payment cancelled');
          updateField('paymentStatus', 'Cancelled');
        },
        onError: (error) => {
          console.error('Payment error:', error);
          updateField('paymentStatus', 'Error');
        },
      }
    );
  }, [onSuccess, updateField]);

  return (
    <GlowingBox>
      <div style={{
        padding: '1rem',
        background: '#1a0028',
        borderRadius: '8px',
        boxShadow: '0 0 12px #8c4dcc',
        color: '#e0e0ff',
      }}>
        <h3>
          <PiSymbol /> Pay with Pi Network
        </h3>
        <p>Processing $74.99 payment...</p>
        <p>Status: {paymentStatus || 'Pending'}</p>
      </div>
    </GlowingBox>
  );
}

PaymentForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};