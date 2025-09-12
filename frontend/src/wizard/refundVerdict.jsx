import React from 'react';
import { useRouter } from 'next/router';
import useAnswers from '../hooks/useAnswers';

export default function RefundVerdictPage() {
  const { answers, verdict } = useAnswers();
  const router = useRouter();

  if (!verdict || !verdict.taxVerdict) {
    return (
      <div className="verdict-page loading">
        <p>Loading your tax optimization results...</p>
      </div>
    );
  }

  const {
    standardAmount,
    itemizedTotal,
    recommendedStrategy,
    reasoning,
  } = verdict.taxVerdict;

  const strategyLabel =
    recommendedStrategy === 'standard' ? 'Standard Deduction' : 'Itemized Deduction';

  return (
    <div className="verdict-page">
      <h1>Tax Deduction Strategy</h1>

      <div className="strategy-summary">
        <p><strong>Recommended:</strong> {strategyLabel}</p>
        <p><strong>Standard Amount:</strong> ${standardAmount.toLocaleString()}</p>
        <p><strong>Itemized Total:</strong> ${itemizedTotal.toLocaleString()}</p>
        <p><strong>Why:</strong> {reasoning}</p>
      </div>

      <hr />

      <p className="integration-note">
        ✅ We've embedded your deduction strategy into your estate flow, ensuring visibility and audit-readiness down the road.
      </p>

      <button className="continue-button" onClick={() => router.push('/finalWill')}>
        Continue to Final Will
      </button>

      <style jsx>{`
        .verdict-page {
          padding: 2rem;
          max-width: 700px;
          margin: auto;
          background: #0b0f1c;
          color: #e4ecff;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(72, 178, 255, 0.3);
        }

        h1 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .strategy-summary p {
          margin: 0.5rem 0;
        }

        .integration-note {
          margin-top: 1.5rem;
          font-size: 0.95rem;
          color: #a0cfff;
        }

        .continue-button {
          margin-top: 2rem;
          width: 100%;
          padding: 1rem;
          background: #3194f0;
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          font-size: 1.2rem;
          color: #a0b8ff;
        }
      `}</style>
    </div>
  );
}