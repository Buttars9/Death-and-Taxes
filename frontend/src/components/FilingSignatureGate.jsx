import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

/**
 * Signature gate for final refund approval.
 * Posts signature confirmation and triggers payout.
 * Displays confirmation once both steps succeed.
 */

export default function FilingSignatureGate({ submissionId, onSigned }) {
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payoutQueued, setPayoutQueued] = useState(false);
  const [error, setError] = useState(null);

  const handleSignature = async () => {
    setLoading(true);
    setError(null);

    try {
      // 🔏 Confirm signature
      await axios.post(`/api/filing/signature/${submissionId}`);
      setSigned(true);
      if (typeof onSigned === 'function') {
        onSigned();
      }

      // 💰 Trigger payout
      await axios.post(`/api/payout/${submissionId}`);
      setPayoutQueued(true);
    } catch (err) {
      console.error('❌ Signature or payout POST error:', err);
      setError('❌ Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (signed && payoutQueued) {
    return (
      <div className="signature-confirmed" role="status">
        ✅ Signature confirmed. Payout queued.
      </div>
    );
  }

  return (
    <div className="signature-gate">
      <label>
        <input
          type="checkbox"
          onChange={handleSignature}
          disabled={loading}
          aria-disabled={loading}
        />
        I confirm that the refund data is accurate and approve processing.
      </label>
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}

FilingSignatureGate.propTypes = {
  submissionId: PropTypes.string.isRequired,
  onSigned: PropTypes.func,
};