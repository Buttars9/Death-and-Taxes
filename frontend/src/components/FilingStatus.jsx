// death-and-taxes/frontend/src/pages/Dashboard/FilingStatus.jsx

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import FilingTrustGate from './FilingTrustGate.jsx';
import RefundEstimateBlock from './RefundEstimateBlock.jsx';
import FilingSignatureGate from './FilingSignatureGate.jsx';

export default function FilingStatus({ submissionId }) {
  const [statusData, setStatusData] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await axios.get(`/api/filing/status/${submissionId}`);
        setStatusData(res.data);
      } catch (err) {
        console.error('Status fetch error:', err);
      }
    }

    if (submissionId) fetchStatus();
  }, [submissionId]);

  if (!submissionId) return null;
  if (!statusData) return <div>Checking filing status…</div>;

  const {
    status,
    receivedAt,
    trustConfirmed,
    refundEstimate,
    signatureConfirmed,
    signedAt,
    payoutStatus,
    payoutQueuedAt
  } = statusData;

  return (
    <div className="filing-status">
      <h3>Status: {status}</h3>
      <p><strong>Received At:</strong> {new Date(receivedAt).toLocaleString()}</p>
      <p><strong>Trust Confirmed:</strong> {trustConfirmed ? 'Yes' : 'No'}</p>
      <p><strong>Refund Estimate:</strong> {refundEstimate} credits</p>
      <p><strong>Signature Confirmed:</strong> {signatureConfirmed ? 'Yes' : 'No'}</p>
      {signatureConfirmed && signedAt && (
        <p><strong>Signed At:</strong> {new Date(signedAt).toLocaleString()}</p>
      )}
      {payoutStatus && (
        <>
          <p><strong>Payout Status:</strong> {payoutStatus}</p>
          {payoutQueuedAt && (
            <p><strong>Payout Queued At:</strong> {new Date(payoutQueuedAt).toLocaleString()}</p>
          )}
        </>
      )}

      <FilingTrustGate statusData={statusData}>
        <RefundEstimateBlock credits={statusData.payload?.credits || []} />
        {!signatureConfirmed && (
          <FilingSignatureGate
            submissionId={submissionId}
            onSigned={() => console.log('Signature captured')}
          />
        )}
      </FilingTrustGate>
    </div>
  );
}

FilingStatus.propTypes = {
  submissionId: PropTypes.string.isRequired
};