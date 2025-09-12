import React, { useState } from 'react';
import PropTypes from 'prop-types';
import RefundEstimatePanel from '../components/RefundEstimatePanel.jsx';
import GlowingBox from '../components/GlowingBox.jsx';
import PiSymbol from '../components/PiSymbol.jsx';
import { useWizardStore } from '../stores/wizardStore.js';
import { formatCurrency } from '../utils/formatters.js';
import { generateReceipt } from '../utils/generateReceipt.js';
import { generateWillText } from '../shared/utils/generateWillText.js';

export default function FinalReview() {
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submittedAt, setSubmittedAt] = useState(null);

  const { answers, willData } = useWizardStore();

  const {
    filingStatus = 'single',
    income = 0,
    deductionType = 'standard',
    deductions = [],
    credits = [],
    residentState,
    trustConfirmed,
    contactEmail,
  } = answers;

  const standardDeductions = {
    single: 13850,
    married_joint: 27700,
    head: 20800,
  };

  const taxBrackets = {
    single: [
      { upTo: 11000, rate: 0.10 },
      { upTo: 44725, rate: 0.12 },
      { upTo: 95375, rate: 0.22 },
    ],
    married_joint: [
      { upTo: 22000, rate: 0.10 },
      { upTo: 89450, rate: 0.12 },
      { upTo: 190750, rate: 0.22 },
    ],
    head: [
      { upTo: 15700, rate: 0.10 },
      { upTo: 59850, rate: 0.12 },
      { upTo: 95350, rate: 0.22 },
    ],
  };

  let deductionAmount = deductionType === 'standard'
    ? standardDeductions[filingStatus] || 0
    : deductions.length * 1000;

  const taxableIncome = Math.max(income - deductionAmount, 0);
  const brackets = taxBrackets[filingStatus] || [];
  let remaining = taxableIncome;
  let tax = 0;

  for (let i = 0; i < brackets.length; i++) {
    const { upTo, rate } = brackets[i];
    const prevUpTo = i === 0 ? 0 : brackets[i - 1].upTo;
    const slice = Math.min(remaining, upTo - prevUpTo);
    if (slice > 0) {
      tax += slice * rate;
      remaining -= slice;
    }
  }

  const creditAmount = credits.length * 1000;
  const estimatedRefund = Math.max(creditAmount - tax, 0);

  const handleSubmit = async () => {
    if (!trustConfirmed) {
      alert('Please confirm your trust declaration before submitting.');
      return;
    }

    const timestamp = new Date().toISOString();
    setSubmitted(true);
    setSubmittedAt(timestamp);

    const userId = contactEmail || 'anonymous';
    const taxYear = new Date().getFullYear();
    const refundUSD = estimatedRefund;
    const refundPi = (estimatedRefund / 7).toFixed(3);
    const escrowHash = btoa(`${userId}-${taxYear}-${timestamp}`);

    const logSubmission = useWizardStore.getState().logSubmission;

    logSubmission({
      timestamp,
      refundUSD,
      refundPi,
      escrowHash,
      status: 'Confirmed',
      receiptUrl: `/receipts/${userId}_${taxYear}.pdf`,
    });

    generateReceipt({
      userId,
      taxYear,
      refundUSD,
      refundPi,
      escrowHash,
    });

    const payload = {
      event: 'submitted_tax_return',
      timestamp,
      refundAmount: estimatedRefund,
      filingStatus,
      income,
      residentState,
      contactEmail: contactEmail || null,
      trustConfirmed: true,
    };

    try {
      const res = await fetch('/api/logEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('📤 Submission logging failed:', err);
    }
  };

  const formattedTime = submittedAt ? new Date(submittedAt).toLocaleString() : null;
  const willText = generateWillText(willData);

  return (
    <GlowingBox>
      <div style={{
        padding: '2rem',
        background: '#1a0028',
        borderRadius: '8px',
        boxShadow: '0 0 12px #8c4dcc',
        color: '#e0e0ff',
      }}>
        <h2 style={{ color: '#a166ff', marginBottom: '1rem' }}>
          <PiSymbol /> Review & Confirm
        </h2>
        <p style={{ marginBottom: '1rem' }}>Review your filing details before submission.</p>

        {submitted ? (
          <div style={{
            background: '#1c2232',
            padding: '1rem',
            borderRadius: '10px',
            boxShadow: '0 0 15px rgba(72, 178, 255, 0.2)',
          }}>
            <h3 style={{ color: '#72caff' }}>✅ Submission Complete</h3>
            {result?.id ? (
              <>
                <p>Your return ID: <strong>{result.id}</strong></p>
                {formattedTime && (
                  <p>Submitted at: <strong>{formattedTime}</strong></p>
                )}
                <p>Estimated Refund: <strong>{formatCurrency(estimatedRefund)}</strong></p>
              </>
            ) : (
              <p>Submission confirmed, but no return ID was generated.</p>
            )}
          </div>
        ) : (
          <>
            <RefundEstimatePanel refund={{ total: estimatedRefund, state: residentState, filingStatus, income, deduction: deductionAmount, dependents: answers.dependents?.length || 0 }} />
            <div style={{
              marginTop: '2rem',
              background: '#1c2232',
              padding: '1rem',
              borderRadius: '10px',
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
            }}>
              <h3 style={{ color: '#a166ff' }}><PiSymbol /> Will Preview</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Courier New, monospace', fontSize: '0.95rem', color: '#e1e8fc' }}>
                {willText}
              </pre>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '2rem',
            }}>
              <button
                style={{
                  background: '#1c2232',
                  color: '#e0e0ff',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #3a3f55',
                  fontWeight: 'bold',
                }}
                onClick={() => useWizardStore.getState().goToStep('will')}
              >
                Back
              </button>
              <button
                style={{
                  background: '#72caff',
                  color: '#0f131f',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 'bold',
                }}
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </GlowingBox>
  );
}

FinalReview.propTypes = {
  filing: PropTypes.object,
  onBack: PropTypes.func,
  onSubmit: PropTypes.func,
};