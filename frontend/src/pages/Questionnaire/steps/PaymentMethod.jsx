import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox';
import PiSymbol from '../../../components/PiSymbol';
import PaymentForm from '../../../components/PaymentForm';

const methods = [
  { key: 'pi', label: 'Pi Wallet' },
  { key: 'paypal', label: 'PayPal' },
  { key: 'venmo', label: 'Venmo' },
  { key: 'credit-card', label: 'Credit Card' },
];

export default function PaymentMethod({ answers, setAnswers, onNext, onBack }) {
  const [method, setMethod] = useState('pi');

  useEffect(() => {
    if (answers.paymentMethod) {
      setMethod(answers.paymentMethod);
    }
  }, [answers]);

  const handleSubmit = () => {
    setAnswers((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
    onNext();
  };

  return (
    <GlowingBox>
      <div className="payment-method-step">
        <h2>
          <PiSymbol /> Select Payment Method
        </h2>
        <p>
          Before we file your return, a one-time <strong>$74.99 filing fee</strong> is required.
          This covers secure processing, audit-grade storage, and refund optimization.
        </p>
        <p>
          Choose how you’d like to pay. All methods are secure and IRS-compliant.
        </p>

        <ul className="payment-options">
          {methods.map(({ key, label }) => (
            <li
              key={key}
              className={`payment-option ${method === key ? 'selected' : ''}`}
              role="radio"
              aria-checked={method === key}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') setMethod(key);
              }}
            >
              <label>
                <input
                  type="radio"
                  name="payment"
                  value={key}
                  checked={method === key}
                  onChange={() => setMethod(key)}
                />
                {label}
              </label>
            </li>
          ))}
        </ul>

        <div className="fee-confirmation">
          <p>
            💸 You’ll be charged <strong>$74.99</strong> via <strong>{methods.find(m => m.key === method)?.label}</strong> before your return is submitted.
          </p>
        </div>

        <PaymentForm />

        <div className="step-buttons">
          {onBack && (
            <button type="button" onClick={onBack}>
              Back
            </button>
          )}
          <button className="primary" onClick={handleSubmit}>
            Continue
          </button>
        </div>
      </div>

      <style jsx>{`
        .payment-method-step {
          color: #e1e8fc;
        }
        .payment-options {
          list-style: none;
          padding: 0;
          margin: 2rem 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .payment-option {
          background: #1c2232;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 10px rgba(118, 198, 255, 0.1);
        }
        .payment-option:hover {
          box-shadow: 0 0 15px rgba(118, 198, 255, 0.3);
        }
        .payment-option.selected {
          background: #2a3248;
          box-shadow: 0 0 20px rgba(118, 198, 255, 0.5);
        }
        .fee-confirmation {
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }
        .step-buttons {
          display: flex;
          justify-content: space-between;
        }
        button.primary {
          background: #72caff;
          color: #0f131f;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          font-weight: bold;
        }
      `}</style>
    </GlowingBox>
  );
}

PaymentMethod.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};