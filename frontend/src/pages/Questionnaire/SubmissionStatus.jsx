// death-and-taxes/src/pages/Questionnaire/SubmissionStatus.jsx

import React, { useEffect, useState, useRef } from 'react';

export default function SubmissionStatus({ userId }) {
  const [status, setStatus] = useState('Loading...');
  const [refundAmount, setRefundAmount] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const retryCount = useRef(0);
  const intervalId = useRef(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/filingStatus?userId=${userId}`);
        const data = await response.json();

        setStatus(data.status);
        setRefundAmount(data.refundAmountUSD);
        setLastChecked(Date.now());
        retryCount.current = 0;
      } catch (error) {
        console.error('Error fetching submission status:', error);
        setStatus('Unable to load status.');
        retryCount.current += 1;

        if (retryCount.current >= 3) {
          clearInterval(intervalId.current);
          intervalId.current = setInterval(fetchStatus, 30000); // backoff to 30s
        }
      }
    };

    fetchStatus();
    intervalId.current = setInterval(fetchStatus, 15000); // poll every 15s

    return () => clearInterval(intervalId.current);
  }, [userId]);

  const formattedTime = lastChecked
    ? new Date(lastChecked).toLocaleTimeString()
    : null;

  const statusColor = {
    'Queued': '#888',
    'In Review': '#007bff',
    'Approved': '#28a745',
    'Rejected': '#dc3545',
    'Unable to load status.': '#ff9900',
  }[status] || '#333';

  return (
    <div className="submission-status">
      <h2 className="step-title">Your Filing Status</h2>
      <p className="step-description">
        We’re keeping you informed every step of the way. Here's your current status:
      </p>

      <div className="status-indicator" style={{ color: statusColor }}>
        <strong>Status:</strong> {status}
      </div>

      {refundAmount !== null && (
        <div className="refund-indicator">
          <strong>Estimated Refund:</strong> ${refundAmount}
        </div>
      )}

      {formattedTime && (
        <p className="last-checked">
          Last checked at {formattedTime}
        </p>
      )}
    </div>
  );
}