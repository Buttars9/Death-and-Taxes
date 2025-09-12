import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox.jsx';
import PiSymbol from '../../../components/PiSymbol.jsx';

export default function BankInfoStep({ answers, setAnswers, onNext, onBack }) {
  const [routingNumber, setRoutingNumber] = useState(answers.routingNumber || '');
  const [accountNumber, setAccountNumber] = useState(answers.accountNumber || '');
  const [accountType, setAccountType] = useState(answers.accountType || 'checking');

  useEffect(() => {
    setRoutingNumber(answers.routingNumber || '');
    setAccountNumber(answers.accountNumber || '');
    setAccountType(answers.accountType || 'checking');
  }, [answers]);

  const handleSubmit = () => {
    if (!routingNumber || !accountNumber) {
      alert('Please enter routing and account number for direct deposit.');
      return;
    }
    setAnswers((prev) => ({
      ...prev,
      routingNumber,
      accountNumber,
      accountType,
    }));
    onNext();
  };

  return (
    <GlowingBox>
      <div className="bank-info-step">
        <h2>
          <PiSymbol /> Bank Information for Refund
        </h2>
        <p>
          Enter your bank details for direct deposit of your refund.
        </p>

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
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #3a3f55',
                background: '#1c2232',
                color: '#e1e8fc'
              }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="accountNumber">Account Number</label>
            <input
              id="accountNumber"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Account number"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #3a3f55',
                background: '#1c2232',
                color: '#e1e8fc'
              }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="accountType">Account Type</label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #3a3f55',
                background: '#1c2232',
                color: '#e1e8fc'
              }}
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>
        </div>

        <div className="step-buttons">
          {onBack && (
            <button type="button" onClick={onBack}>
              Back
            </button>
          )}
          <button
            className="primary"
            onClick={handleSubmit}
            disabled={!routingNumber || !accountNumber}
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
        input, select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #3a3f55;
          background: #1c2232;
          color: #e1e8fc;
        }
        input:focus, select:focus {
          outline: none;
          border-color: #72caff;
          box-shadow: 0 0 4px #72caff;
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
          background: #3a3f55;
        }
      `}</style>
    </GlowingBox>
  );
}

BankInfoStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};