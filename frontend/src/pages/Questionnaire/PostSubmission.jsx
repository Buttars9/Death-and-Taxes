// death-and-taxes/src/pages/Questionnaire/PostSubmission.jsx

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useWizardStore } from '../../store/wizardStore';

export default function PostSubmission({ answers, setAnswers, livePrices }) {
  const setSubmissionConfirmed = useWizardStore((s) => s.setSubmissionConfirmed);
  const ssn = useWizardStore((s) => s.ssn);

  useEffect(() => {
    const submitData = async () => {
      const timestamp = new Date().toISOString();
      const escrowHash = btoa(`${ssn}-${timestamp}`);

      const payload = {
        ...answers,
        submissionTime: timestamp,
        escrowHash,
      };

      try {
        const response = await fetch('/submitFiling', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          console.error('Submission failed:', response.status);
          return;
        }

        setAnswers((prev) => ({
          ...prev,
          submissionComplete: true,
        }));

        setSubmissionConfirmed(); // ✅ triggers IRSReceipt
      } catch (error) {
        console.error('Error submitting filing:', error);
      }
    };

    submitData();
  }, [answers, setAnswers, ssn, setSubmissionConfirmed]);

  const refundUSD = answers.estimatedRefundUSD || 0;
  const refundPi = livePrices?.pi ? (refundUSD / livePrices.pi).toFixed(3) : '—';

  return (
    <div className="post-submission">
      <h2 className="confirmation-title">Submission Received 🎉</h2>
      <p className="confirmation-details">
        Thanks for trusting us. Your info is being queued for review and refund disbursement.
      </p>

      <div className="refund-preview">
        <p><strong>Estimated Refund:</strong></p>
        <p>💵 ${refundUSD}</p>
        <p>🟣 ≈ {refundPi} π</p>
      </div>

      <div className="fee-confirmation">
        <p>
          💸 Your <strong>$74.99 filing fee</strong> has been successfully processed via{' '}
          <strong>{answers.paymentMethod || 'your selected method'}</strong>.
        </p>
      </div>

      <p className="next-steps">
        You’ll receive updates as we process your submission. Feel free to log in anytime to check status.
      </p>
    </div>
  );
}

PostSubmission.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  livePrices: PropTypes.shape({
    pi: PropTypes.number,
  }),
};