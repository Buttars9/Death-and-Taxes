// death-and-taxes/src/components/modals/SessionExpiryModal.jsx

import React, { useEffect, useState, useRef } from 'react';

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
const COUNTDOWN_DURATION = 60 * 1000; // 60 seconds before auto-logout

export default function SessionExpiryModal({ onExtend, onSaveDraft, onLogout }) {
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const lastActivityRef = useRef(Date.now());
  const countdownTimer = useRef(null);
  const expiryTimer = useRef(null);

  useEffect(() => {
    const resetActivity = () => {
      lastActivityRef.current = Date.now();
      if (isVisible) {
        setIsVisible(false);
        clearInterval(countdownTimer.current);
        setCountdown(null);
      }
    };

    const handleInactivity = () => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= INACTIVITY_LIMIT) {
        setIsVisible(true);
        setCountdown(COUNTDOWN_DURATION / 1000);

        countdownTimer.current = setInterval(() => {
          setCountdown((c) => {
            if (c === 1) {
              clearInterval(countdownTimer.current);
              onSaveDraft();
              onLogout();
              return null;
            }
            return c - 1;
          });
        }, 1000);
      }
    };

    expiryTimer.current = setInterval(handleInactivity, 10000); // check every 10s

    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('keydown', resetActivity);

    return () => {
      clearInterval(expiryTimer.current);
      clearInterval(countdownTimer.current);
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keydown', resetActivity);
    };
  }, [onExtend, onSaveDraft, onLogout, isVisible]);

  return isVisible ? (
    <div className="session-expiry-modal">
      <h2 className="modal-title">Session Expiring</h2>
      <p className="modal-description">
        You’ve been inactive for a while. Want to keep going or save your progress?
      </p>
      {countdown !== null && (
        <p className="modal-countdown">
          Auto-logout in <strong>{countdown}</strong> seconds...
        </p>
      )}
      <div className="modal-buttons">
        <button onClick={onExtend}>Keep Working</button>
        <button onClick={onSaveDraft}>Save Draft</button>
        <button onClick={onLogout}>Log Out</button>
      </div>
    </div>
  ) : null;
}