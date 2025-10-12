import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox';
import PiSymbol from '../../../components/PiSymbol';
import RefundEstimate from '../../../components/RefundEstimate';
import { useWizardStore } from '../../../stores/wizardStore';
import HelpIcon from '../../../components/HelpIcon';
import HelpModal from '../../../components/HelpModal';
import '../../../components/HelpIcon.css';

export default function RefundSummaryStep({ livePrices, onNext, onBack }) {
  const answers = useWizardStore((state) => state.answers);
  const setAnswers = useWizardStore((state) => state.setAnswers);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    setContactEmail(answers?.contactEmail || '');
  }, [answers]);

  const handleSubmit = () => {
    if (confirmationChecked) {
      const updatedAnswers = {
        ...answers,
        trustConfirmed: true,
      };
      setAnswers(updatedAnswers);
      onNext();
    }
  };

  return (
    <>
      <style>{`
        .refund-summary-step {
          color: #e1e8fc;
        }
        .fee-reminder {
          margin: 1rem 0;
          font-style: italic;
        }
        .input-group {
          margin: 1.5rem 0;
        }
        .input-group input[type="email"] {
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
        .back-button {
          background: #1c2232;
          color: #e1e8fc;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: 1px solid #3a3f55;
          font-weight: bold;
        }
        .next-button {
          background: #72caff;
          color: #0f131f;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          font-weight: bold;
        }
        .next-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .fee-reminder {
            margin: 0.75rem 0;
            font-size: 0.9rem;
          }
          .input-group {
            margin: 1rem 0;
          }
          .input-group input[type="email"] {
            padding: 0.4rem;
          }
          .confirmation-checkbox {
            margin: 1rem 0;
            font-size: 0.9rem;
          }
          .step-buttons {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            margin-top: 1.5rem;
          }
          .back-button,
          .next-button {
            width: 100%;
            padding: 0.75rem;
          }
        }
      `}</style>
      <GlowingBox>
        <div className="refund-summary-step">
          <h2 className="h2-title">
            <PiSymbol /> Your Refund Estimate <HelpIcon onClick={() => { setSelectedTopic('refundSummaryStep'); setShowHelpModal(true); }} />
          </h2>
          <p className="description">
            Based on your inputs, here’s your current estimate. A final breakdown will follow post-review.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <RefundEstimate manualFields={answers} />
          </div>

          <div className="fee-reminder">
            <p>
              💸 A one-time <strong>$74.99 filing fee</strong> will be charged before your return is submitted.
              This covers secure processing, audit-grade storage, and refund optimization.
            </p>
          </div>

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
              <button
                type="button"
                onClick={onBack}
                className="back-button"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!confirmationChecked}
              className="next-button"
            >
              Next
            </button>
          </div>
        </div>
        {showHelpModal && (
          <HelpModal topic={selectedTopic} onClose={() => setShowHelpModal(false)} />
        )}
      </GlowingBox>
    </>
  );
}

RefundSummaryStep.propTypes = {
  livePrices: PropTypes.shape({
    pi: PropTypes.number,
  }),
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};