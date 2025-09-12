// death-and-taxes/src/components/modals/SubmissionTimeoutGuard.jsx

import React, { useEffect, useState, useRef } from 'react';

export default function SubmissionTimeoutGuard({ formData, onRetry, onRestore }) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(null);
  const retryTimer = useRef(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHasTimedOut(true);
      setRetryCountdown(15); // 15s auto-retry window

      retryTimer.current = setInterval(() => {
        setRetryCountdown((c) => {
          if (c === 1) {
            clearInterval(retryTimer.current);
            onRetry(formData);
            return null;
          }
          return c - 1;
        });
      }, 1000);
    }, 60 * 1000); // 1 minute grace period

    return () => {
      clearTimeout(timeoutId);
      clearInterval(retryTimer.current);
    };
  }, [formData, onRetry]);

  return hasTimedOut ? (
    <div className="submission-timeout-guard">
      <h2 className="modal-title">Trouble Submitting?</h2>
      <p className="modal-description">
        It looks like your submission might have timed out. Let’s fix that.
      </p>

      {retryCountdown !== null && (
        <p className="retry-countdown">
          Auto-retrying in <strong>{retryCountdown}</strong> seconds...
        </p>
      )}

      <div className="modal-buttons">
        <button onClick={() => onRetry(formData)}>Retry Submission</button>
        <button onClick={onRestore}>Restore Draft</button>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    </div>
  ) : null;
}