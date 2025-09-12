import React from 'react';
import { useWizardStore } from '../../../store/wizardStore';
import { exportIRSPreviewPDF } from '../../../utils/exportIRSPreview';

export default function IRSPreview() {
  const store = useWizardStore.getState();
  const agi = store.estimateAGI();
  const refundEstimate = store.getRefundableCredits().length * 1000;

  const payload = {
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
  };

  return (
    <div className="irs-preview">
      <h2>IRS Filing Preview</h2>
      <p>This is a snapshot of what will be submitted. Review carefully.</p>

      <ul className="preview-list">
        {Object.entries(payload).map(([label, value]) => (
          <li key={label} className="preview-item">
            <strong>{label}:</strong> {value || '—'}
          </li>
        ))}
      </ul>

      <button onClick={exportIRSPreviewPDF}>
        Download Filing Summary (PDF)
      </button>

      <style jsx>{`
        .irs-preview {
          padding: 2rem;
          background: #1c2232;
          border-radius: 12px;
          color: #e1e8fc;
        }
        .preview-list {
          list-style: none;
          padding: 0;
          margin: 2rem 0;
        }
        .preview-item {
          margin-bottom: 1rem;
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