import React, { useState } from 'react';
import RefundEstimatePanel from './RefundEstimatePanel';
import SignatureCapture from './SignatureCapture';
import { IrsPayloadPreview } from './IrsPayloadPreview.jsx';
import { useAnswerValidator } from '../hooks/useAnswerValidator.js';
import { buildIrsPayload } from '../shared/utils/buildIrsPayload.js'; // ✅ FIXED PATH
import './FinalStep.css';

export default function FinalStep({ refund, answers, onSubmit }) {
  const [signature, setSignature] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { isValid, issues, validatedAnswers } = useAnswerValidator(answers);
  const irsPayload = buildIrsPayload(validatedAnswers);

  const handleSignatureSave = (dataURL) => {
    setSignature(dataURL);
    setError('');
  };

  const handleSubmit = async () => {
    if (!signature) {
      setError('✍️ Please sign before submitting.');
      return;
    }

    if (!isValid) {
      setError('❌ Validation failed. Please review your answers.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/submit-filing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        onSubmit(data);
      } else {
        setError('❌ Submission failed. Please try again.');
        console.error('Submission error:', data);
      }
    } catch (err) {
      setError('❌ Submission failed. Please try again.');
      console.error('Error submitting filing:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="final-step">
        <h2>✅ Filing Submitted</h2>
        <p>Your return has been successfully submitted.</p>
      </div>
    );
  }

  return (
    <div className="final-step">
      <h2>🧾 Review & Submit</h2>

      <RefundEstimatePanel refund={refund} />
      <SignatureCapture onSave={handleSignatureSave} />

      {!isValid && (
        <div className="error-text" role="alert">
          ❌ Validation Issues:
          <ul>
            {issues.map((issue) => (
              <li key={issue.key}>
                <strong>{issue.label}:</strong> {issue.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <IrsPayloadPreview payload={irsPayload} onConfirm={handleSubmit} />

      {error && (
        <div className="error-text" role="alert">
          {error}
        </div>
      )}

      <style jsx>{`
        .final-step {
          margin-top: 2rem;
          padding: 2rem;
          background: #0f131f;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(118, 198, 255, 0.3);
          color: #e1e8fc;
        }
        h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #7ec8ff;
        }
        .error-text {
          margin-top: 1rem;
          color: #ff4d4d;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}