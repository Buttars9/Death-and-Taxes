import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox';
import PiSymbol from '../../../components/PiSymbol';
import PaymentForm from '../../../components/PaymentForm';
import axios from 'axios';
import { useAuthStore } from '../../../auth/authStore.jsx'; // Add this import (adjust path if needed)
import HelpIcon from '../../../components/HelpIcon';
import HelpModal from '../../../components/HelpModal';
import '../../../components/HelpIcon.css';

const methods = [
  { key: 'pi', label: 'Pi Wallet' },
  { key: 'paypal', label: 'PayPal' },
  { key: 'venmo', label: 'Venmo' },
  { key: 'credit-card', label: 'Credit Card' },
];

export default function PaymentMethod({ answers, setAnswers, onNext, onBack }) {
  const authenticateWithPi = useAuthStore((s) => s.authenticateWithPi); // Add this to access auth action
  const [method, setMethod] = useState('pi');
  const [piPrice, setPiPrice] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
const API_BASE = import.meta.env.VITE_API_BASE;
  const basePrice = 74.99;
  const estateAddon = answers.includeEstatePlan ? 25.0 : 0;
  const totalPrice = basePrice + estateAddon;
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  useEffect(() => {
    if (answers.paymentMethod) {
      setMethod(answers.paymentMethod);
    }
  }, [answers]);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd')
      .then((res) => res.json())
      .then((data) => {
        const price = data['pi-network']?.usd;
        if (price) setPiPrice(price);
      })
      .catch(() => setPiPrice(null));
  }, []);

  useEffect(() => {
    axios.get('/api/settings/wallet')
      .then((res) => {
        const pi = res.data?.wallet?.pi || '';
        setWalletAddress(pi);
        if (typeof setAnswers === 'function') {
          setAnswers({ ...answers, piWalletAddress: pi });
        }
      })
      .catch(() => setWalletAddress(''));
  }, []);

  const handleSubmit = () => {
    if (typeof setAnswers === 'function') {
      setAnswers({
        ...answers,
        paymentMethod: method,
      });
      onNext();
    }
  };

  const validatePin = () => {
    if (pin === '4546314') {
      setAnswers({
        ...answers,
        adminOverride: true,
        paymentMethod: 'pi',
        paymentConfirmed: true,
      });
      setShowPinModal(false);
      onNext();
    } else {
      alert('Invalid PIN');
    }
  };

  const piAmount = piPrice ? (totalPrice / piPrice).toFixed(2) : null;

  return (
    <GlowingBox>
      <div className="payment-method-step">
        <h2>
          <span onClick={() => setShowPinModal(true)} style={{ cursor: 'pointer' }}>
            <PiSymbol />
          </span>{' '}
          Select Payment Method <HelpIcon onClick={() => { setSelectedTopic('piPaymentStep'); setShowHelpModal(true); }} />
        </h2>

        <p>
          Before we file your return, a one-time <strong>${totalPrice.toFixed(2)} filing fee</strong> is required.
          This covers secure processing, audit-grade storage, and refund optimization.
        </p>
        <p>Choose how you’d like to pay. All methods are secure and IRS-compliant.</p>

        <ul className="payment-options">
  {methods.map(({ key, label }) => {
    const isPi = key === 'pi';
    return (
      <li
        key={key}
        className={`payment-option ${isPi ? '' : 'disabled'} ${method === key ? 'selected' : ''}`}
        onClick={() => isPi && setMethod(key)}
        style={{ cursor: isPi ? 'pointer' : 'not-allowed' }}
      >
        <label>
          <input
            type="radio"
            checked={method === key}
            disabled={!isPi}
            onChange={() => isPi && setMethod(key)}
          />
          {label} {isPi ? '' : '(coming soon)'}
        </label>
      </li>
    );
  })}
</ul>

        <div className="fee-confirmation">
          <p>
            💸 You’ll be charged <strong>${totalPrice.toFixed(2)}</strong> via{' '}
            <strong>{methods.find((m) => m.key === method)?.label}</strong> before your return is submitted.
          </p>
        </div>
        {method === 'pi' && (
          <>
            <p style={{ color: '#ff4d6d' }}>
              Please send <strong>{piAmount} PI</strong> to:
            </p>
            <p style={{ fontWeight: 'bold', color: '#e1e8fc' }}>
              {walletAddress || 'No wallet address set. Please check admin page.'}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
              Once your Pi payment is verified, your tax filing and estate documents will be unlocked automatically.
            </p>

            <input
              type="text"
              placeholder="Enter your Pi wallet address"
              value={answers.piSenderAddress || ''}
              onChange={(e) => setAnswers({ ...answers, piSenderAddress: e.target.value })}
              style={{
                marginTop: '1rem',
                padding: '0.5rem',
                borderRadius: '6px',
                border: 'none',
                background: '#2a2f45',
                color: '#e1e8fc',
                width: '100%',
              }}
            />

            <button
              style={{
                marginTop: '1rem',
                background: '#72caff',
                color: '#0f131f',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 'bold',
              }}
              onClick={async () => { // Make async to await auth if needed
                console.log('Pi SDK:', window?.Pi);
                if (!window?.Pi?.authenticated || !window.Pi.consentedScopes?.includes('payments')) { // Check state
                  try {
                    await authenticateWithPi(); // Auth if not ready (requests 'payments' scope)
                  } catch (err) {
                    console.error('Auth failed:', err);
                    alert('Authentication failed. Please try logging in again.');
                    return; // Exit if auth fails
                  }
                }
                const paymentData = {
                  amount: piAmount,
                  memo: 'Death & Taxes filing fee',
                  metadata: {
                    sender: answers.piSenderAddress || 'unknown',
                    filingFee: totalPrice.toFixed(2),
                    estatePlan: answers.includeEstatePlan || false,
                  },
                };
                const paymentCallbacks = {
  onReadyForServerApproval: (paymentId) => {
    console.log('Ready for server approval:', paymentId);
    axios
      .post(`${API_BASE}/api/pi-approve`, { paymentId, sandbox: window.Pi.sandbox })
      .catch(err => console.error('Approval failed:', err)); // Send to backend for approval
  },
  onReadyForServerCompletion: (paymentId, txid) => {
    console.log('Ready for server completion:', paymentId, txid);
    axios
      .post(`${API_BASE}/api/pi-complete`, { paymentId, txid, sandbox: window.Pi.sandbox })
      .then(() => {
        setAnswers({
          ...answers,
          paymentConfirmed: true,
          paymentMethod: 'pi',
        });
        onNext();
      })
      .catch(err => console.error('Completion failed:', err));
  },
  onCancel: (paymentId) => {
    console.log('Payment cancelled:', paymentId);
  },
  onError: (error, payment) => {
    console.error('Payment error:', error);
  },
};
window.Pi.createPayment(paymentData, paymentCallbacks);
              }}
            >
              Pay with Pi Wallet
            </button>
          </>
        )}

        {method !== 'pi' && <PaymentForm />}

        <div className="step-buttons">
          {onBack && (
            <button className="secondary" onClick={onBack}>
              Back
            </button>
          )}
          <button className="primary" onClick={handleSubmit}>
            Continue
          </button>
        </div>
      </div>

      {showPinModal && (
        <div className="pin-modal">
          <div className="modal-content">
            <h3>Enter Admin PIN</h3>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
            />
            <div className="modal-buttons">
              <button onClick={validatePin}>Submit</button>
              <button onClick={() => setShowPinModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showHelpModal && (
        <HelpModal topic={selectedTopic} onClose={() => setShowHelpModal(false)} />
      )}

      <style jsx>{`
        .payment-method-step {
          color: #e1e8fc;
        }
        ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        li {
          margin-bottom: 0.75rem;
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
          transition: all 0.2s ease;
          box-shadow: 0 0 10px rgba(118, 198, 255, 0.1);
          opacity: 1;
        }
        .payment-option.selected {
          border: 2px solid #72caff;
        }
        .fee-confirmation {
          margin-bottom: 2rem;
          font-size: 0.95rem;
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
        button.secondary {
          background: transparent;
          color: #e1e8fc;
          border: 1px solid #72caff;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: bold;
        }
        .pin-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 19, 31, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }
        .modal-content {
          background: #1c2232;
          padding: 2rem;
          border-radius: 8px;
          color: #e1e8fc;
          width: 320px;
          text-align: center;
        }
        .modal-content input {
          width: 100%;
          padding: 0.5rem;
          margin-top: 1rem;
          border-radius: 6px;
          border: none;
          background: #2a2f45;
          color: #e1e8fc;
        }
        .modal-buttons {
          margin-top: 1rem;
          display: flex;
          justify-content: space-between;
        }
        .modal-buttons button {
          background: #72caff;
          color: #0f131f;
          padding: 0.5rem 1rem;
          borderRadius: '6px';
          border: none;
          fontWeight: 'bold',
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