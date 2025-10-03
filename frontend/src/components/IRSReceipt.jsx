import React from 'react';
import { useWizardStore } from "../stores/wizardStore";
import { calculateRefund } from "../shared/utils/calculateRefund.js";

export default function IRSReceipt() {
  const store = useWizardStore.getState();
  const agi = store.estimateAGI();

  const refund = calculateRefund({
    state: store.state,
    statesPaid: Array.from(
      new Set(
        (store.answers.incomeSources || [])
          .map((src) => src.box15?.trim())
          .filter(Boolean)
      )
    ),
    filingStatus: store.getFilingStatus(),
    income: agi,
    dependents: store.answers.dependents?.length || 0,
    age: store.answers.age || 0,
    tipIncome: store.answers.tipIncome || 0,
    overtimeIncome: store.answers.overtimeIncome || 0,
    saltPaid: store.answers.saltPaid || 0,
    assets: store.answers.assets || [],
    deductionType: store.answers.deductionType || 'standard',
    deductions: store.answers.deductions || [],
    credits: store.answers.credits || [],
    taxWithheld: store.answers.incomeSources?.reduce((sum, src) => sum + Number(src.box2 || src.federalTaxWithheld || 0), 0) || 0,
    estimatedPayments: Number(store.answers.estimatedPayments) || 0,
    stateTaxWithheld: store.answers.incomeSources?.reduce((sum, src) => sum + Number(src.box17 || 0), 0) || 0,
    incomeSources: store.answers.incomeSources || [],
  });

  const timestamp = new Date().toISOString();
  const escrowHash = btoa(`${store.ssn}-${timestamp}`);

  const formatArray = (arr) =>
    Array.isArray(arr)
      ? arr.map((item) =>
          typeof item === 'object' ? JSON.stringify(item) : String(item)
        ).join(', ')
      : '—';

  const formatCurrency = (amount) => `$${Number(amount).toLocaleString()}`;

  const stateRefunds = refund.stateRefunds || {};
  const stateNames = Object.keys(stateRefunds);

  const isFederalRefund = refund.federalRefund > 0;
  const federalAmount = isFederalRefund ? refund.federalRefund : refund.federalBalanceDue;

  const receipt = {
    FilingStatus: store.getFilingStatus(),
    AGI: `$${agi.toLocaleString()}`,
    IncomeSources: formatArray(store.answers.incomeSources),
    Deductions: formatArray(store.answers.deductions),
    Credits: formatArray(store.answers.credits),
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

      <div className="refund-breakdown">
        <h3>📊 Refund Breakdown</h3>
        <ul className="receipt-list">
          <li className="receipt-item">
            <strong>Federal:</strong>{' '}
            <span style={{ color: isFederalRefund ? '#00ff9d' : '#ff4d6d' }}>
              {isFederalRefund
                ? `Refund of ${formatCurrency(federalAmount)}`
                : `Balance Due of ${formatCurrency(federalAmount)}`}
            </span>
          </li>
          {stateNames.map((stateName) => {
            const data = stateRefunds[stateName];
            const isRefund = data.stateRefund > 0;
            const amount = isRefund ? data.stateRefund : data.stateBalanceDue;
            return (
              <li key={stateName} className="receipt-item">
                <strong>{stateName}:</strong>{' '}
                <span style={{ color: isRefund ? '#00ff9d' : '#ff4d6d' }}>
                  {isRefund
                    ? `Refund of ${formatCurrency(amount)}`
                    : `Balance Due of ${formatCurrency(amount)}`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

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
        .refund-breakdown h3 {
          margin-top: 2rem;
          color: #a166ff;
        }
      `}</style>
    </div>
  );
}