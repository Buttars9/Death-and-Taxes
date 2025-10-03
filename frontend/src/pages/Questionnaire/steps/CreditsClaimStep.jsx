import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import GlowingBox from '../../../components/GlowingBox.jsx';
import PiSymbol from '../../../components/PiSymbol';
import RefundEstimate from '../../../components/RefundEstimate';
import { useWizardStore } from '../../../stores/wizardStore';
import { getEligibleCredits } from '../../../shared/utils/creditEngine.js';
import { calculateRefund } from '../../../shared/utils/calculateRefund.js';
const creditOptions = [
  { label: 'Education Credits (American Opportunity, Lifetime Learning)', value: 'education' },
  { label: 'Retirement Savings Contributions Credit (Saver’s Credit)', value: 'retirement' },
  { label: 'Healthcare Premium Credit (Marketplace)', value: 'healthcare' },
  { label: 'Foreign Tax Credit', value: 'foreign' },
  { label: 'Adoption Credit', value: 'adoption' },
  { label: 'Residential Energy Credit', value: 'energy' },
  { label: 'Electric Vehicle Credit', value: 'ev' },
  { label: 'Childcare Credit (Daycare, after-school)', value: 'childcare' },
  { label: 'Other', value: 'other' },
];

const variableCredits = ['education', 'retirement', 'healthcare', 'foreign', 'adoption', 'energy', 'ev', 'childcare', 'other'];

export default function CreditsClaimStep({ onNext, onBack, stepIndex }) {
  const navigate = useNavigate();
  const { setAnswers, answers: storeAnswers, maritalStatus, age, capitalGains, retirementIncome, foreignAssets, autoLoanInterest } = useWizardStore();
  const dependents = storeAnswers.dependents || [];
  const incomeSources = storeAnswers.incomeSources || [];
  const [selected, setSelected] = useState([]);
  const [creditExpenses, setCreditExpenses] = useState({});
  const [error, setError] = useState('');

  const totalIncome = incomeSources?.reduce((sum, src) => sum + (parseFloat(src.box1 || src.amount) || 0), 0) || 0;
  const numDependents = dependents?.length || 0;

  // Debug dependents to catch any override issues
  useEffect(() => {
    console.log('CreditsClaimStep dependents:', { dependents, numDependents });
  }, [dependents, numDependents]);

  // EITC Eligibility Check (2025 IRS Rules)
  let eitcEligible = false;
  if (maritalStatus !== 'marriedFilingSeparately') {
    const isMarried = maritalStatus === 'marriedJointly';
    const limits = {
      0: { single: 18591, married: 25511 },
      1: { single: 49084, married: 56004 },
      2: { single: 55768, married: 62688 },
      3: { single: 59899, married: 66819 },
    };
    const numKids = Math.min(numDependents, 3);
    const limit = limits[numKids]?.[isMarried ? 'married' : 'single'] || 0;
    eitcEligible = totalIncome <= limit;
  }

  // Initialize selected and creditExpenses only on mount
  useEffect(() => {
    const initialCredits = Array.isArray(storeAnswers.credits) ? storeAnswers.credits : [];
    const initialSelected = initialCredits
      .map(c => c.type)
      .filter(c => c !== 'eitc' || eitcEligible);
    const initialExpenses = {};
    initialCredits.forEach(c => {
      if (variableCredits.includes(c.type)) {
        initialExpenses[c.type] = c.expense || 0;
      }
    });
    setSelected(initialSelected);
    setCreditExpenses(initialExpenses);
    console.log('CreditsClaimStep initial state:', { initialCredits, stepIndex });
  }, []); // Empty dependency array for mount-only initialization

  // Handle Child Tax Credit auto-selection
  useEffect(() => {
    setSelected(prev => {
      const hasChildTax = prev.includes('child_tax');
      if (numDependents > 0 && !hasChildTax) {
        return [...prev.filter(v => v !== 'eitc' || eitcEligible), 'child_tax'];
      } else if (numDependents === 0 && hasChildTax) {
        return prev.filter(v => v !== 'child_tax' && (v !== 'eitc' || eitcEligible));
      }
      return prev.filter(v => v !== 'eitc' || eitcEligible);
    });
  }, [numDependents, eitcEligible]);

  // Memoized updateStoreAnswers to prevent unnecessary re-renders
  const updateStoreAnswers = useCallback(() => {
    if (setAnswers && typeof setAnswers === 'function') {
      const currentCredits = Array.isArray(storeAnswers.credits) ? storeAnswers.credits : [];
      const currentCreditState = currentCredits.map(c => ({
        type: c.type,
        expense: c.expense || 0,
      }));
      const newCreditState = selected.map(value => ({
        type: value,
        expense: creditExpenses[value] || 0,
      }));
      if (JSON.stringify(currentCreditState) === JSON.stringify(newCreditState)) {
        return; // Skip update if credits and expenses haven't changed
      }
      console.log('Updating credits:', { selected, creditExpenses });
      const eligibleCredits = getEligibleCredits({
        income: totalIncome,
        dependents: numDependents,
        filingStatus: maritalStatus || 'single',
        capitalGains: capitalGains || 0,
        retirementIncome: retirementIncome || 0,
        foreignAssets: foreignAssets || [],
        autoLoanInterest: autoLoanInterest || 0,
        age: age || 0,
        expenses: creditExpenses,
      });
      const creditObjects = selected.map(value => {
        const credit = eligibleCredits.find(c => c.type === value) || { type: value, amount: 0, note: 'Not calculated' };
        return { type: value, amount: credit.amount || 0, note: credit.note || '', expense: creditExpenses[value] || 0 };
      });
      const childCredits = dependents.filter(d => d.name && d.dob && d.relationship === 'child').length * 2200;
      const eitcCredit = eligibleCredits.find(c => c.type === 'eitc');
      const earnedIncomeCredit = eitcCredit?.amount || 0;

      if (childCredits > 0 && !creditObjects.some(c => c.type === 'child_tax')) {
        creditObjects.push({ type: 'child_tax', amount: childCredits, note: `${numDependents} qualifying children`, expense: 0 });
      }

      if (earnedIncomeCredit > 0 && !creditObjects.some(c => c.type === 'eitc')) {
        creditObjects.push({ type: 'eitc', amount: earnedIncomeCredit, note: 'Automatically applied based on income and dependents', expense: 0 });
      }

      setAnswers({ ...storeAnswers, credits: creditObjects });
    } else {
      console.warn('setAnswers is not a function');
      setError('State update failed. Please try again.');
    }
  }, [setAnswers, storeAnswers, selected, creditExpenses, totalIncome, numDependents, maritalStatus, capitalGains, retirementIncome, foreignAssets, autoLoanInterest, age]);

 // Update store only when selected credits or expenses change
useEffect(() => {
  updateStoreAnswers();
}, [selected, creditExpenses]);

  const toggleCredit = (value) => {
    setError('');
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleExpenseChange = (creditType, amount) => {
    setCreditExpenses((prev) => ({ ...prev, [creditType]: amount }));
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      setError('Please select at least one credit or proceed if none apply.');
      return;
    }
    updateStoreAnswers();
    if (onNext) onNext();
    else navigate('/filing/next-step');
  };

  const handleBack = () => {
    const childCredits = dependents.filter(d => d.name && d.dob && d.relationship === 'child').length * 2200;
    const eligibleCredits = getEligibleCredits({
      income: totalIncome,
      dependents: numDependents,
      filingStatus: maritalStatus || 'single',
      capitalGains: capitalGains || 0,
      retirementIncome: retirementIncome || 0,
      foreignAssets: foreignAssets || [],
      autoLoanInterest: autoLoanInterest || 0,
      age: age || 0,
      expenses: creditExpenses,
    });
    const eitcCredit = eligibleCredits.find(c => c.type === 'eitc');
    const earnedIncomeCredit = eitcCredit?.amount || 0;

    const manualCredits = Array.isArray(storeAnswers.credits)
      ? storeAnswers.credits.filter(c => c.type !== 'child_tax' && c.type !== 'eitc')
      : [];

    const credits = [
      ...manualCredits,
      ...(childCredits > 0 ? [{ type: 'child_tax', amount: childCredits }] : []),
      ...(earnedIncomeCredit > 0 ? [{ type: 'eitc', amount: earnedIncomeCredit }] : []),
    ];

    const refundEstimate = calculateRefund({ ...storeAnswers, credits });

    setAnswers({
      ...storeAnswers,
      credits,
      refundEstimate,
    });

    updateStoreAnswers();
    if (onBack) onBack();
    else navigate('/filing/previous-step');
  };

  return (
    <GlowingBox>
      <div className="credits-step">
        <div className="section">
          <h2 style={{ color: '#a166ff' }}>
            <PiSymbol /> Claim Credits
          </h2>
          <p>
            Select all tax credits you may qualify for. We’ll calculate the amount based on your details. Enter qualified expenses where prompted.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
              <PiSymbol /> Automatic Credits
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {numDependents > 0 && (
                <li style={{ marginBottom: '0.5rem', color: '#00ff9d' }}>
                  Child Tax Credit: Automatically applied for {numDependents} dependent{numDependents > 1 ? 's' : ''} entered earlier.
                </li>
              )}
              {eitcEligible && (
                <li style={{ marginBottom: '0.5rem', color: '#00ff9d' }}>
                  Earned Income Tax Credit (EITC): Automatically applied based on your income and family size.
                </li>
              )}
              {numDependents === 0 && !eitcEligible && (
                <li style={{ marginBottom: '0.5rem', color: '#c0b3ff' }}>
                  No automatic credits apply based on your details.
                </li>
              )}
            </ul>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
              <PiSymbol /> Additional Credits
            </h3>
            <ul className="credit-options">
              {creditOptions.map(({ label, value }) => {
                const isVariable = variableCredits.includes(value);
                const isDisabled = (value === 'eitc' && !eitcEligible) || (value === 'child_tax' && numDependents === 0);
                const displayLabel = isDisabled ? `${label} (Ineligible)` : label;
                return (
                  <li
                    key={value}
                    className={`credit-option ${selected.includes(value) ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={(e) => {
                      if (isDisabled || e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;
                      toggleCredit(value);
                    }}
                    role="button"
                    tabIndex={isDisabled ? -1 : 0}
                    onKeyPress={(e) => {
                      if (isDisabled || e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;
                      if (e.key === 'Enter') toggleCredit(value);
                    }}
                    style={{
                      background: selected.includes(value) ? '#2a3248' : '#1c2232',
                      padding: '1rem',
                      borderRadius: '8px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      boxShadow: selected.includes(value) ? '0 0 20px rgba(118, 198, 255, 0.5)' : '0 0 10px rgba(118, 198, 255, 0.1)',
                      textDecoration: isDisabled ? 'line-through' : 'none',
                    }}
                  >
                    {displayLabel}
                    {selected.includes(value) && isVariable && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Qualified Amount ($):</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={creditExpenses[value] || ''}
                          onChange={(e) => handleExpenseChange(value, parseFloat(e.target.value) || 0)}
                          style={{
                            width: '100%',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            border: '1px solid #3a3f55',
                            background: '#1c2232',
                            color: '#e1e8fc',
                          }}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            {error && <p className="error-text" style={{ color: '#ff6666', marginTop: '0.5rem' }}>{error}</p>}
          </div>

          <div className="step-buttons" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
            {onBack && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  background: '#1c2232',
                  color: '#e1e8fc',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #3a3f55',
                  fontWeight: 'bold',
                }}
              >
                Back
              </button>
            )}
            <button
              type="button"
              className="primary"
              onClick={handleSubmit}
              style={{
                background: '#72caff',
                color: '#0f131f',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 'bold',
              }}
            >
              Next
            </button>
          </div>
        </div>
        <div style={{ flex: 1, padding: '1rem' }}>
          <RefundEstimate manualFields={storeAnswers || { maritalStatus: 'single', incomeSources: [] }} />
        </div>
      </div>

      <style jsx>{`
        .credits-step {
          color: #e1e8fc;
          padding: 2rem;
          display: flex;
          justify-content: center;
        }
        .section {
          margin-bottom: 2rem;
          width: 100%;
          max-width: 720px;
        }
        .credit-options {
          list-style: none;
          padding: 0;
          margin: 2rem 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
        }
        .credit-option {
          background: #1c2232;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 10px rgba(118, 198, 255, 0.1);
        }
        .credit-option:hover {
          box-shadow: 0 0 15px rgba(118, 198, 255, 0.3);
        }
        .credit-option.selected {
          background: #2a3248;
          box-shadow: 0 0 20px rgba(118, 198, 255, 0.5);
        }
        .credit-option.disabled {
          text-decoration: line-through;
          cursor: not-allowed;
        }
        .step-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          gap: 1rem;
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
        .error-text {
          color: #ff6666;
          margin-top: 0.5rem;
        }
      `}</style>
    </GlowingBox>
  );
}

CreditsClaimStep.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  stepIndex: PropTypes.number,
};