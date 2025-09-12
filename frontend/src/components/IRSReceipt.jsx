import React from 'react';
import { useWizardStore } from '../../../store/wizardStore';
import { exportIRSReceiptPDF } from '../../../utils/exportIRSReceipt';

export default function IRSReceipt() {
  const store = useWizardStore.getState();
  const agi = store.estimateAGI();
  const refundEstimate = store.getRefundableCredits().length * 1000;
  const timestamp = new Date().toISOString();
  const escrowHash = btoa(`${store.ssn}-${timestamp}`); // symbolic hash

  const receipt = {
    FilingStatus: store.getFilingStatus(),
    AGI: `$${agi.toLocaleString()}`,
    EstimatedRefund: `$${refundEstimate.toLocaleString()}`,
    IncomeSources: store.answers.incomeSources.join(', '),
    Deductions: store.answers.deductions.join(', '),
    Credits: store.answers.credits.join(', '),
    EscrowEnabled: store.paymentType === 'pi' ? 'Yes' : 'No',
    TrustConfirmed: store.answers.trustConfirmed ? 'Yes' : 'No',
    SSN: store.ssn,
    IRS_PIN: store.irsPin,
    State: store.state,
    SubmissionTime: timestamp,
    EscrowHash: escrowHash,
  };

  return (
    <div className="irs-receipt">
      <div className="receipt-header">
        <h2>✅ Filing Confirmed</h2>
        <span className="badge">Verified by Pi</span>
      </div>
      <p>Your submission has been recorded and escrow logic triggered.</p>

      <ul className="receipt-list">
        {Object.entries(receipt).map(([label, value]) => (
          <li key={label} className="receipt-item">
            <strong>{label}:</strong>{' '}
            {label === 'SubmissionTime' ? (
              <span className="timestamp">{value}</span>
            ) : label === 'EscrowHash' ? (
              <code className="hash">{value}</code>
            ) : (
              value || '—'
            )}
          </li>
        ))}
      </ul>

      <button onClick={exportIRSReceiptPDF}>
        Download Receipt (PDF)
      </button>

      <style jsx>{`
        .irs-receipt {
          padding: 2rem;
          background: #0f131f;
          border-radius: 12px;
          color: #c2f0ff;
          box-shadow: 0 0 12px #72caff;
        }
        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .badge {
          background: #72caff;
          color: #0f131f;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: bold;
          box-shadow: 0 0 6px #72caff;
        }
        .receipt-list {
          list-style: none;
          padding: 0;
          margin: 2rem 0;
        }
        .receipt-item {
          margin-bottom: 1rem;
        }
        .timestamp {
          font-family: monospace;
          color: #9beaff;
        }
        .hash {
          font-family: monospace;
          background: #1c2232;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: #72caff;
        }
        button {
          background: #72caff;
          color: #0f131f;
          padding: 0.75rem 1.25rem;
          border-radius: 6px;
          border: none;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}