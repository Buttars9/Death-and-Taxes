import React from 'react';

export default function SignatureStep({ onNext, signature, setSignature }) {
  const isValid = signature.trim().length > 0;

  return (
    <div className="wizard-step signature-step">
      <h2>🔏 Signature Capture</h2>
      <p className="step-description">
        Type your full name as it will appear on your digital refund and estate filing:
      </p>

      <input
        type="text"
        value={signature}
        onChange={(e) => setSignature(e.target.value)}
        placeholder="John Q. Taxpayer"
        className="text-input"
        aria-label="Signature input"
      />

      <button
        onClick={onNext}
        className="primary-btn"
        disabled={!isValid}
        aria-disabled={!isValid}
      >
        Continue
      </button>

      <style jsx>{`
        .signature-step {
          padding: 2rem;
          max-width: 600px;
          margin: auto;
          background: #0d101a;
          color: #e1e7ff;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(108, 208, 255, 0.2);
        }

        h2 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .step-description {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .text-input {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          border-radius: 8px;
          border: 1px solid #3c465d;
          background: #1b2233;
          color: #e1e7ff;
          margin-bottom: 2rem;
        }

        .primary-btn {
          width: 100%;
          padding: 1rem;
          background: #3194f0;
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .primary-btn:disabled {
          background: #3c465d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}