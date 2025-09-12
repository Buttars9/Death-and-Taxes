// death-and-taxes/src/pages/Questionnaire/steps/TrustDeclarationStep.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox';
import PiSymbol from '../../../components/PiSymbol';
import { formatCurrency } from '../../../utils/formatters';

export default function TrustDeclarationStep({ answers, setAnswers, onNext, onBack }) {
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [contactEmail, setContactEmail] = useState('');

  const refund = answers?.estimatedRefund || 0;
  const fee = 74.99;

  useEffect(() => {
    setContactEmail(answers?.contactEmail || '');
  }, [answers]);

  const handleSubmit = () => {
    if (confirmationChecked) {
      const timestamp = new Date().toISOString();
      setAnswers((prev) => ({
        ...prev,
        trustConfirmed: true,
        contactEmail: contactEmail || null,
        submissionTimestamp: timestamp,
      }));
      onNext();
    }
  };

  return (
    <GlowingBox>
      <div className="trust-declaration-step">
        <h2>
          <PiSymbol /> Confirm & Trust
        </h2>
        <p>
          You’ve reviewed your details and understand that this submission initiates the refund workflow.
          We operate with transparency and trust—your data is never shared.
        </p>

        <div className="refund-summary">
          <p>
            💰 <strong>Estimated Refund:</strong> {formatCurrency(refund)}
          </p>
          <p>
            💸 <strong>Filing Fee:</strong> {formatCurrency(fee)}
          </p>
        </div>

        <p className="fee-reminder">
          This one-time fee covers secure processing, audit-grade storage, and refund optimization.
        </p>

        <div className="input-group">
          <label htmlFor="contactEmail">Optional Email for Receipt & Updates</label>
          <input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <label className="confirmation-checkbox">
          <input
            type="checkbox"
            checked={confirmationChecked}
            onChange={() => setConfirmationChecked((prev) => !prev)}
          />
          I confirm that all information provided is accurate to the best of my knowledge.
        </label>

        <div className="step-buttons">
          {onBack && (
            <button type="button" onClick={onBack}>
              Back
            </button>
          )}
          <button
            className="primary"
            onClick={handleSubmit}
            disabled={!confirmationChecked}
          >
            Submit & Begin Refund
          </button>
        </div>
      </div>

      <style jsx>{`
        .trust-declaration-step {
          color: #e1e8fc;
        }
        .refund-summary {
          margin: 1rem 0;
          font-size: 1.1rem;
        }
        .fee-reminder {
          margin: 1rem 0;
          font-style: italic;
        }
        .input-group {
          margin: 1.5rem 0;
        }
        input[type="email"] {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: none;
          background: #1c2232;
          color: #e1e8fc;
        }
        .confirmation-checkbox {
          display: block;
          margin: 1.5rem 0;
        }
        .step-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
        }
        button.primary {
          background: #72caff;
          color: #0f131f;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          font-weight: bold;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </GlowingBox>
  );
}

TrustDeclarationStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};