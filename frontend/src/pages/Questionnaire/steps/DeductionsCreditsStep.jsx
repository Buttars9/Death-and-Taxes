import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import GlowingBox from '../../../components/GlowingBox.jsx';
import PiSymbol from '../../../components/PiSymbol';
import RefundEstimate from '../../../components/RefundEstimate';
import { useWizardStore } from '../../../stores/wizardStore';

const deductionTypeOptions = [
  { label: 'Standard Deduction', value: 'standard' },
  { label: 'Itemized Deductions', value: 'itemized' },
];

const deductionOptions = [
  { label: 'Student Loan Interest', value: 'student_loan' },
  { label: 'Mortgage Interest', value: 'mortgage' },
  { label: 'Charitable Donations', value: 'charity' },
  { label: 'Medical Expenses', value: 'medical' },
  { label: 'State & Local Taxes (SALT)', value: 'salt' },
  { label: 'Education Expenses', value: 'education' },
  { label: 'Retirement Contributions (IRA)', value: 'retirement' },
  { label: 'Health Savings Account (HSA)', value: 'hsa' },
  { label: 'Educator Expenses', value: 'educator' },
  { label: 'Business Expenses (Schedule C)', value: 'business' },
  { label: 'Casualty/Theft Losses', value: 'casualty' },
  { label: 'Other', value: 'other' },
];

export default function DeductionStep({ onNext, onBack }) {
  const navigate = useNavigate();
  const { setAnswers, answers: storeAnswers, dependents, incomeSources, maritalStatus } = useWizardStore();
  const [deductionType, setDeductionType] = useState(storeAnswers.deductionType || 'standard');
  const [selected, setSelected] = useState([]);
  const [deductionAmounts, setDeductionAmounts] = useState({});
  const [error, setError] = useState('');

  // Memoized updateStoreAnswers to prevent unnecessary re-renders
  const updateStoreAnswers = useCallback(() => {
    if (setAnswers && typeof setAnswers === 'function') {
      const currentDeductions = Array.isArray(storeAnswers.deductions) ? storeAnswers.deductions : [];
      const currentDeductionState = currentDeductions.map(d => ({
        value: d.value,
        amount: d.amount || 0,
      }));
      const newDeductionState = selected.map(value => ({
        value,
        amount: deductionAmounts[value] || 0,
      }));
      if (JSON.stringify(currentDeductionState) === JSON.stringify(newDeductionState)) {
        console.log('Skipping store update: No changes in deductions', { currentDeductionState, newDeductionState });
        return;
      }
      console.log('Updating deductions:', { selected, deductionAmounts, deductionType });
      const deductionObjects = newDeductionState;
      console.log('Setting store answers:', { deductionObjects, deductionType, dependents, incomeSources, maritalStatus });
      setAnswers({
        ...storeAnswers,
        deductionType,
        deductions: deductionType === 'standard' ? [] : deductionObjects,
        // Explicitly preserve all fields
        incomeSources: storeAnswers.incomeSources || incomeSources || [],
        dependents: storeAnswers.dependents || dependents || [],
        maritalStatus: storeAnswers.maritalStatus || maritalStatus || 'single',
        agi: storeAnswers.agi || '',
        firstName: storeAnswers.firstName || '',
        lastName: storeAnswers.lastName || '',
        ssn: storeAnswers.ssn || '',
        dob: storeAnswers.dob || '',
        address: storeAnswers.address || '',
        residentState: storeAnswers.residentState || '',
        priorAGI: storeAnswers.priorAGI || '',
        irsPin: storeAnswers.irsPin || '',
        spouseName: storeAnswers.spouseName || '',
        spouseSSN: storeAnswers.spouseSSN || '',
        spouseDob: storeAnswers.spouseDob || '',
        spouseIncomeSources: storeAnswers.spouseIncomeSources || [],
        foreignIncome: storeAnswers.foreignIncome || '',
        w2s: storeAnswers.w2s || [],
      });
    } else {
      console.warn('setAnswers is not a function');
      setError('State update failed. Please try again.');
    }
  }, [setAnswers, storeAnswers, selected, deductionAmounts, deductionType, dependents, incomeSources, maritalStatus]);

  // Initialize selected, deductionAmounts, and deductionType from storeAnswers
  useEffect(() => {
    const initialDeductions = Array.isArray(storeAnswers.deductions) ? storeAnswers.deductions : [];
    const initialSelected = initialDeductions.map(d => d.value);
    const initialAmounts = {};
    initialDeductions.forEach(d => {
      if (deductionOptions.map(o => o.value).includes(d.value)) {
        initialAmounts[d.value] = d.amount || 0;
      }
    });
    setSelected(initialSelected);
    setDeductionAmounts(initialAmounts);
    setDeductionType(initialDeductions.length > 0 ? 'itemized' : 'standard');
    console.log('DeductionStep initial state:', { initialDeductions, initialSelected, initialAmounts, dependents, incomeSources, maritalStatus });
    updateStoreAnswers(); // Initial store sync
  }, []); // Run only on mount

  // Update store when selected, deductionAmounts, or deductionType change
  useEffect(() => {
    console.log('Triggering store update due to changes:', { selected, deductionAmounts, deductionType });
    updateStoreAnswers();
  }, [selected, deductionAmounts, deductionType, updateStoreAnswers]);

  const handleDeductionTypeToggle = (value) => {
    console.log('Toggling deduction type:', { value });
    setDeductionType(value);
    setSelected(value === 'itemized' ? selected : []);
    updateStoreAnswers(); // Update store after type change
  };

  const toggleDeduction = (value) => {
    const updated = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    console.log('Toggling deduction:', { value, updated });
    setSelected(updated);
    if (deductionOptions.map(o => o.value).includes(value) && !selected.includes(value)) {
      setDeductionAmounts(prev => ({ ...prev, [value]: 0 }));
    } else if (deductionOptions.map(o => o.value).includes(value) && selected.includes(value)) {
      setDeductionAmounts(prev => {
        const newAmounts = { ...prev };
        delete newAmounts[value];
        return newAmounts;
      });
    }
    updateStoreAnswers(); // Update store after selection change
  };

  const handleAmountChange = (value, amount) => {
    console.log('Updating deduction amount:', { value, amount });
    setDeductionAmounts(prev => ({ ...prev, [value]: parseFloat(amount) || 0 }));
    updateStoreAnswers(); // Update store after amount change
  };

  const handleSubmit = () => {
    console.log('handleSubmit triggered, onNext:', typeof onNext, 'onNext exists:', !!onNext);
    try {
      updateStoreAnswers();
      if (onNext && typeof onNext === 'function') {
        console.log('Calling onNext');
        onNext();
      } else {
        console.warn('onNext is not a function or null');
        setError('Next action is not available. Check wizard configuration.');
        navigate('/filing/credits');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', { message: error.message, stack: error.stack });
      setError('An error occurred. Proceeding to next step.');
      navigate('/filing/credits');
    }
  };

  const handleBack = () => {
    console.log('handleBack triggered, onBack:', typeof onBack, 'onBack exists:', !!onBack);
    if (onBack && typeof onBack === 'function') {
      console.log('Calling onBack');
      onBack();
    } else {
      console.warn('onBack is not a function or null');
      navigate('/filing/income');
    }
  };

  return (
    <GlowingBox>
      <div className="deductions-step" style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>
            <PiSymbol /> Any deductions to claim?
          </h2>
          <p>
            Deductions reduce your taxable income and may unlock a bigger refund.
            Choose “Standard” for simplicity, or “Itemized” to claim specific expenses.
          </p>

          <div className="section">
            <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
              <PiSymbol /> Deduction Type
            </h3>
            <ul className="deduction-type-options" style={{
              listStyle: 'none',
              padding: 0,
              margin: '2rem 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}>
              {deductionTypeOptions.map(({ label, value }) => (
                <li
                  key={value}
                  className={`deduction-type-option ${deductionType === value ? 'selected' : ''}`}
                  onClick={() => handleDeductionTypeToggle(value)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleDeductionTypeToggle(value);
                  }}
                  style={{
                    background: deductionType === value ? '#2a3248' : '#1c2232',
                    padding: '1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: deductionType === value ? '0 0 20px rgba(118, 198, 255, 0.5)' : '0 0 10px rgba(118, 198, 255, 0.1)',
                  }}
                >
                  {label}
                </li>
              ))}
            </ul>
            {error && <p className="error-text" style={{ color: '#ff6666', marginTop: '0.5rem' }}>{error}</p>}
          </div>

          {deductionType === 'itemized' && (
            <div className="section">
              <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
                <PiSymbol /> Itemized Deductions
              </h3>
              <ul className="deduction-options" style={{
                listStyle: 'none',
                padding: 0,
                margin: '2rem 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}>
                {deductionOptions.map(({ label, value }) => (
                  <li
                    key={value}
                    className={`deduction-option ${selected.includes(value) ? 'selected' : ''}`}
                    onClick={(e) => {
                      if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;
                      toggleDeduction(value);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;
                      if (e.key === 'Enter') toggleDeduction(value);
                    }}
                    style={{
                      background: selected.includes(value) ? '#2a3248' : '#1c2232',
                      padding: '1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: selected.includes(value) ? '0 0 20px rgba(118, 198, 255, 0.5)' : '0 0 10px rgba(118, 198, 255, 0.1)',
                    }}
                  >
                    {label}
                    {selected.includes(value) && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Amount ($):</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={deductionAmounts[value] || ''}
                          onChange={(e) => handleAmountChange(value, e.target.value)}
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
                ))}
              </ul>
            </div>
          )}

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
        .deductions-step {
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
        .deduction-type-options, .deduction-options {
          list-style: none;
          padding: 0;
          margin: 2rem 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .deduction-type-option, .deduction-option {
          background: #1c2232;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 10px rgba(118, 198, 255, 0.1);
        }
        .deduction-type-option:hover, .deduction-option:hover {
          box-shadow: 0 0 15px rgba(118, 198, 255, 0.3);
        }
        .deduction-type-option.selected, .deduction-option.selected {
          background: #2a3248;
          box-shadow: 0 0 20px rgba(118, 198, 255, 0.5);
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

DeductionStep.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};