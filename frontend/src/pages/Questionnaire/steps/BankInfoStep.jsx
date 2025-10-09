import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox.jsx';
import PiSymbol from '../../../components/PiSymbol.jsx';
import HelpModal from '../../../../components/HelpModal.jsx';
import HelpIcon from '../../../../components/HelpIcon.jsx';
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
    <GlowingBox>
      <div className="bank-info-step">
        <h2>
          <PiSymbol /> Bank Information for Refund
        </h2>
        <div style={{ float: 'right' }}>
  <HelpIcon onClick={() => setShowHelp(true)} />
</div>
        <p>Enter your bank details for direct deposit of your refund.</p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
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
            style={{
              background: '#1c2232',
              color: '#e1e8fc',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #3a3f55',
              fontWeight: 'bold',
            }}
          >
            Back
          </button>
          <button
            className="primary"
            onClick={handleNext}
            style={{
              background: '#72caff',
              color: '#0f131f',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
            }}
          >
            Next
          </button>
        </div>
      </div>

      <style jsx>{`
        .bank-info-step {
          color: #e1e8fc;
          padding: 2rem;
        }
        .input-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e1e8fc;
        }
        input,
        select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #3a3f55;
          background: #1c2232;
          color: #e1e8fc;
        }
        input:focus,
        select:focus {
          outline: none;
          border-color: #72caff;
          box-shadow: 0 0 4px #72caff;
        }
        .step-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
        }
        .trust-note {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #ffcc66;
        }
      `}</style>
      {showHelp && (
  <HelpModal topic="bankInfo.overview" onClose={() => setShowHelp(false)} />
)}
    </GlowingBox>
  );
}

BankInfoStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};