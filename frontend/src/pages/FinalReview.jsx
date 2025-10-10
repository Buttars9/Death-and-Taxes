import React, { useState } from 'react';
import PropTypes from 'prop-types';
import RefundEstimate from '../components/RefundEstimate.jsx';
import GlowingBox from '../components/GlowingBox.jsx';
import PiSymbol from '../components/PiSymbol.jsx';
import { useWizardStore } from '../stores/wizardStore.js';
import { formatCurrency } from '../utils/formatters.js';
import { generateWillText } from '../shared/utils/generateWillText.js';
import { generateTrustText } from '../shared/utils/generateTrustText.js';
import { generatePoaText } from '../shared/utils/generatePoaText.js';
import { generateTodText } from '../shared/utils/generateTodText.js';
import { generateExecutorText } from '../shared/utils/generateExecutorText.js';
import { generateHipaaText } from '../shared/utils/generateHipaaText.js';
import { generateFinalDirective } from '../shared/utils/generateFinalDirective.js';
import HelpIcon from '../components/HelpIcon';
import HelpModal from '../components/HelpModal';
import '../components/HelpIcon.css';

export default function FinalReview({ onBack, onNext }) {
  const { answers } = useWizardStore();
  const {
    filingStatus = 'single',
    income = 0,
    deductionType = 'standard',
    deductions = [],
    credits = [],
    residentState,
    contactEmail,
    paymentConfirmed,
    willData = {},
  } = answers;

  const standardDeductions = {
    single: 13850,
    married: 27700,
    head: 20800,
  };

  const taxBrackets = {
    single: [
      { upTo: 11000, rate: 0.10 },
      { upTo: 44725, rate: 0.12 },
      { upTo: 95375, rate: 0.22 },
    ],
    married: [
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

  const deductionAmount = deductionType === 'standard'
    ? standardDeductions[filingStatus] || 0
    : deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);

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

  const creditAmount = credits.reduce((sum, c) => sum + (c.amount || 1000), 0);
  const estimatedRefund = Math.max(creditAmount - tax, 0);
  const willText = generateWillText(willData);
const directiveText = generateFinalDirective(answers).directiveText;
 const poaText = generatePoaText(answers.poaData || {});
const todText = generateTodText(answers.todData || {});
const executorText = generateExecutorText(answers.executorData || {});
const trustText = generateTrustText(answers.trustData || {});
const hipaaText = generateHipaaText(answers.hipaaData || {}); 
const handlePrint = (label, content) => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.setFont('Courier', 'normal');
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(content || `No ${label} available.`, 180);
      doc.text(lines, 10, 10);
      doc.save(`${label}-${contactEmail || 'anonymous'}_${new Date().getFullYear()}.pdf`);
    }).catch(err => console.error(`Print failed: ${err.message}`));
  };

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

        <RefundEstimate manualFields={answers} isSticky={false} />

        <div style={{
          marginTop: '2rem',
          background: '#1c2232',
          padding: '1rem',
          borderRadius: '10px',
          boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
        }}>
          <h3 style={{ color: '#a166ff' }}><PiSymbol /> Will Preview</h3>
          <pre style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'Courier New, monospace',
            fontSize: '0.95rem',
            color: '#e1e8fc',
          }}>
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
            onClick={onBack}
          >
            Back
          </button>
          <div>
            {paymentConfirmed && (
              <>
                <button
                  style={{
                    background: '#72caff',
                    color: '#0f131f',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    marginRight: '1rem',
                  }}
                  onClick={() => handlePrint('Will', willText)}
                >
                  Print Will
                </button>
                <button
                  style={{
                    background: '#72caff',
                    color: '#0f131f',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    marginRight: '1rem',
                  }}
                  onClick={() => handlePrint('Trust', trustText)}
                >
                  Print Trust
                </button>
                <button
                  style={{
                    background: '#72caff',
                    color: '#0f131f',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    marginRight: '1rem',
                  }}
                  onClick={() => handlePrint('POA', poaText)}
                >
                  Print POA
                </button>
                <button
  style={{
    background: '#72caff',
    color: '#0f131f',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 'bold',
    marginRight: '1rem',
  }}
  onClick={() => handlePrint('Advance Directive', directiveText)}
>
  Print Advance Directive
</button>
                <button
                  style={{
                    background: '#72caff',
                    color: '#0f131f',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    marginRight: '1rem',
                  }}
                  onClick={() => handlePrint('TOD', todText)}
                >
                  Print TOD     
                </button>
                <button
                  style={{
                    background: '#72caff',
                    color: '#0f131f',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    marginRight: '1rem',
                  }}
                  onClick={() => handlePrint('ExecutorLetter', executorText)}
                >
                  Print Executor Letter
                </button>
                <button
  style={{
    background: '#72caff',
    color: '#0f131f',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 'bold',
    marginRight: '1rem',
  }}
  onClick={() => handlePrint('HIPAA Release', hipaaText)}
>
  Print HIPAA Release
</button>
              </>
            )}
            <button
              style={{
                background: '#72caff',
                color: '#0f131f',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 'bold',
              }}
              onClick={onNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </GlowingBox>
  );
}

FinalReview.propTypes = {
  onBack: PropTypes.func,
  onNext: PropTypes.func.isRequired, 
};