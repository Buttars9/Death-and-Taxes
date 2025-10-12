import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox.jsx';
import PiSymbol from '../../../components/PiSymbol.jsx';
import HelpModal from '../../../components/HelpModal.jsx';
import HelpIcon from '../../../components/HelpIcon.jsx';
export default function BankInfoStep({ answers, setAnswers, onNext, onBack }) {
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('checking');
const [showHelp, setShowHelp] = useState(false);
  useEffect(() => {
    setRoutingNumber(answers.routingNumber || '');
    setAccountNumber(answers.accountNumber || '');
    setAccountType(answers.accountType || 'checking');
  }, []);

  const isRoutingValid = /^\d{9}$/.test(routingNumber);

  const handleNext = () => {
    setAnswers({
      ...answers,
      routingNumber,
      accountNumber,
      accountType,
    });
    onNext();
  };

  return (
    <>
      <style>{`
        .bank-info-step {
          color: #e1e8fc;
          padding: 2rem;
        }
        .input-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e1e8fc;
        }
        .input-group input,
        .input-group select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #3a3f55;
          background: #1c2232;
          color: #e1e8fc;
        }
        .input-group input:focus,
        .input-group select:focus {
          outline: none;
          border-color: #72caff;
          box-shadow: 0 0 4px #72caff;
        }
        .trust-note {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #ffcc66;
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
        @media (max-width: 768px) {
          .bank-info-step {
            padding: 1rem;
          }
          .input-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          .input-group input,
          .input-group select {
            padding: 0.4rem;
          }
          .trust-note {
            font-size: 0.85rem;
          }
          .step-buttons {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .back-button,
          .next-button {
            width: 100%;
            padding: 0.75rem;
          }
        }
      `}</style>
      <GlowingBox>
        <div className="bank-info-step">
          <h2 className="h2-title">
            <PiSymbol /> Bank Information for Refund <HelpIcon onClick={() => setShowHelp(true)} />
          </h2>
          <p>Enter your bank details for direct deposit of your refund.</p>

          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="routingNumber">Routing Number</label>
              <input
                id="routingNumber"
                type="text"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                placeholder="9 digits"
              />
              {routingNumber && !isRoutingValid && (
                <p className="trust-note">
                  ⚠️ This routing number doesn’t appear valid. It should be exactly 9 digits. Please double-check before submitting to the IRS.
                </p>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="accountNumber">Account Number</label>
              <input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
              />
            </div>

            <div className="input-group">
              <label htmlFor="accountType">Account Type</label>
              <select
                id="accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>
          </div>

          <div className="step-buttons">
            <button
              type="button"
              onClick={onBack}
              className="back-button"
            >
              Back
            </button>
            <button
              className="primary next-button"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
        {showHelp && (
  <HelpModal topic="bankInfo.overview" onClose={() => setShowHelp(false)} />
)}
      </GlowingBox>
    </>
  );
}

BankInfoStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};