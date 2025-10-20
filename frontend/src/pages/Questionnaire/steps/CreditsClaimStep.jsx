import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import GlowingBox from '../../../components/GlowingBox.jsx';
import PiSymbol from '../../../components/PiSymbol';
import RefundEstimate from '../../../components/RefundEstimate';
import { useWizardStore } from '../../../stores/wizardStore';
import { getEligibleCredits } from '../../../shared/utils/creditEngine.js';
import { calculateRefund } from '../../../shared/utils/calculateRefund.js';
import HelpIcon from '../../../components/HelpIcon';
import HelpModal from '../../../components/HelpModal';
import '../../../components/HelpIcon.css';

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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

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
  }, []); // Run only on mount

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
      const qualifyingChildrenCount = dependents.filter(d => d.firstName && d.lastName && d.dob && ['son', 'daughter', 'child'].includes(d.relationship.toLowerCase())).length;
      const childCredits = qualifyingChildrenCount * 2200;
      const eitcCredit = eligibleCredits.find(c => c.type === 'eitc');
      const earnedIncomeCredit = eitcCredit?.amount || 0;

      if (childCredits > 0 && !creditObjects.some(c => c.type === 'child_tax')) {
        creditObjects.push({ type: 'child_tax', amount: childCredits, note: `${qualifyingChildrenCount} qualifying children`, expense: 0 });
      }

      if (earnedIncomeCredit > 0 && !creditObjects.some(c => c.type === 'eitc')) {
        creditObjects.push({ type: 'eitc', amount: earnedIncomeCredit, note: 'Automatically applied based on income and dependents', expense: 0 });
      }

      setAnswers({ ...storeAnswers, credits: creditObjects });
    } else {
      console.warn('setAnswers is not a function');
      setError('State update failed. Please try again.');
    }
  }, [setAnswers, storeAnswers, selected, creditExpenses, totalIncome, numDependents, maritalStatus, capitalGains, retirementIncome, foreignAssets, autoLoanInterest, age, dependents]);

 // Update store only when selected credits or expenses change
useEffect(() => {
  updateStoreAnswers();
}, [updateStoreAnswers]);

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
    const qualifyingChildrenCount = dependents.filter(d => d.firstName && d.lastName && d.dob && ['son', 'daughter', 'child'].includes(d.relationship.toLowerCase())).length;
    const childCredits = qualifyingChildrenCount * 2200;
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
    <>
      <style>{`
        .credits-step {
          display: flex;
          flex-direction: row;
          gap: 2rem;
        }
        .section {
          margin-bottom: 2rem;
          width: 100%;
          max-width: 720px;
        }
        .h3-subtitle {
          color: #a166ff;
          margin-bottom: 1rem;
        }
        .auto-credits-list {
          list-style: none;
          padding: 0;
        }
        .auto-credit-item {
          margin-bottom: 0.5rem;
          color: #00ff9d;
        }
        .no-auto-credit {
          margin-bottom: 0.5rem;
          color: #c0b3ff;
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
          text-align: center;
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
        .amount-label {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.8rem;
        }
        .amount-input {
          width: 100%;
          padding: 0.25rem;
          border-radius: 4px;
          border: 1px solid #3a3f55;
          background: #1c2232;
          color: #e1e8fc;
        }
        .error-text {
          color: #ff6666;
          margin-top: 0.5rem;
        }
        .step-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          gap: 1rem;
        }
        .back-button {
          background: #1c2232;
          color: #e1e8fc;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: 1px solid #3a3f55;
          font-weight: bold;
        }
        .next-button {
          background: #72caff;
          color: #0f131f;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          font-weight: bold;
        }
        .refund-estimate {
          flex: 1;
          padding: 1rem;
        }
        @media (max-width: 768px) {
          .credits-step {
            flex-direction: column;
            gap: 1rem;
          }
          .h2-title {
            font-size: 1.5rem;
          }
          .h3-subtitle {
            font-size: 1.2rem;
            margin-bottom: 0.75rem;
          }
          .section {
            margin-bottom: 1.5rem;
          }
          .credit-options {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 0.75rem;
            margin: 1.5rem 0;
          }
          .credit-option {
            padding: 0.75rem;
            font-size: 0.9rem;
          }
          .amount-label {
            font-size: 0.75rem;
            margin-bottom: 0.2rem;
          }
          .amount-input {
            padding: 0.2rem;
          }
          .auto-credit-item,
          .no-auto-credit {
            font-size: 0.9rem;
          }
          .step-buttons {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .back-button,
          .next-button {
            width: 100%;
            padding: 0.75rem;
          }
          .refund-estimate {
            padding: 0.75rem;
          }
        }
      `}</style>
      <GlowingBox>
        <div className="credits-step">
          <div className="section">
            <h2 className="h2-title">
              <PiSymbol /> Claim Credits <HelpIcon onClick={() => { setSelectedTopic('creditsStep'); setShowHelpModal(true); }} />
            </h2>
            <p>
              Select all tax credits you may qualify for. We’ll calculate the amount based on your details. Enter qualified expenses where prompted.
            </p>

            <div>
              <h3 className="h3-subtitle">
                <PiSymbol /> Automatic Credits
              </h3>
              <ul className="auto-credits-list">
                {numDependents > 0 && (
                  <li className="auto-credit-item">
                    Child Tax Credit: Automatically applied for {numDependents} dependent{numDependents > 1 ? 's' : ''} entered earlier.
                  </li>
                )}
                {eitcEligible && (
                  <li className="auto-credit-item">
                    Earned Income Tax Credit (EITC): Automatically applied based on your income and family size.
                  </li>
                )}
                {numDependents === 0 && !eitcEligible && (
                  <li className="no-auto-credit">
                    No automatic credits apply based on your details.
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="h3-subtitle">
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
                    >
                      {displayLabel}
                      {selected.includes(value) && isVariable && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <label className="amount-label">Qualified Amount ($):</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={creditExpenses[value] || ''}
                            onChange={(e) => handleExpenseChange(value, parseFloat(e.target.value) || 0)}
                            className="amount-input"
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {error && <p className="error-text">{error}</p>}
            </div>

            <div className="step-buttons">
              {onBack && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="back-button"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                className="primary next-button"
                onClick={handleSubmit}
              >
                Next
              </button>
            </div>
          </div>
          <div className="refund-estimate">
            <RefundEstimate manualFields={storeAnswers || { maritalStatus: 'single', incomeSources: [] }} />
          </div>
        </div>
        {showHelpModal && (
          <HelpModal topic={selectedTopic} onClose={() => setShowHelpModal(false)} />
        )}
      </GlowingBox>
    </>
  );
}

CreditsClaimStep.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  stepIndex: PropTypes.number,
};