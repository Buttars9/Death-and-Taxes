import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox.jsx';
import PiSymbol from '../../../components/PiSymbol';

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

export default function DeductionsCreditsStep({ answers, setAnswers, onNext, onBack }) {
  const [deductionType, setDeductionType] = useState('standard');
  const [selected, setSelected] = useState([]);
  const [deductionModalOpen, setDeductionModalOpen] = useState(false);
  const [currentDeduction, setCurrentDeduction] = useState({ value: '', amount: '' });
  const [editingDeductionIndex, setEditingDeductionIndex] = useState(null);

  useEffect(() => {
    if (!answers || typeof answers.parsedFields !== 'object') return;
    const parsedType = answers.parsedFields.deductionType ?? 'standard';
    const parsedList = Array.isArray(answers.parsedFields.deductions)
      ? answers.parsedFields.deductions
      : [];

    const initialType = answers.deductionType ?? parsedType ?? 'standard';
    const initialList = answers.deductions ?? parsedList;

    setDeductionType(initialType);
    setSelected(initialType === 'itemized' ? initialList : []);
    setAnswers((prev) => ({
      ...prev,
      deductionType: initialType,
      deductions: initialType === 'itemized' ? initialList : [],
    }));
  }, [answers, setAnswers]);

  const toggleDeduction = (value) => {
    setCurrentDeduction({ value, amount: '' });
    setEditingDeductionIndex(selected.findIndex((d) => d.value === value));
    setDeductionModalOpen(true);
  };

  const handleAddDeduction = () => {
    if (!currentDeduction.value || !currentDeduction.amount) return;

    const newDeduction = { value: currentDeduction.value, amount: currentDeduction.amount };
    const updated = editingDeductionIndex !== null
      ? selected.map((d, i) => (i === editingDeductionIndex ? newDeduction : d))
      : [...selected, newDeduction];

    setSelected(updated);
    setAnswers((prev) => ({ ...prev, deductions: updated }));
    setDeductionModalOpen(false);
    setCurrentDeduction({ value: '', amount: '' });
    setEditingDeductionIndex(null);
  };

  const handleSubmit = () => {
    setAnswers((prev) => ({
      ...prev,
      deductionType,
      deductions: deductionType === 'itemized' ? selected : [],
    }));
    onNext();
  };

  const renderDeductionModal = () => {
    if (!deductionModalOpen) return null;

    return (
      <div className="modal" style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: '#1a1f2f',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 0 12px rgba(161, 102, 255, 0.3)',
          color: '#e1e8fc',
          maxWidth: '500px',
          width: '90%',
        }}>
          <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
            <PiSymbol /> {editingDeductionIndex !== null ? 'Edit Deduction' : 'Add Deduction'}
          </h3>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>
              Deduction Type
            </label>
            <select
              value={currentDeduction.value}
              onChange={(e) => setCurrentDeduction({ ...currentDeduction, value: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #3a3f55',
                background: '#1c2232',
                color: '#e1e8fc',
              }}
            >
              <option value="">Select</option>
              {deductionOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>
              Amount
            </label>
            <input
              type="number"
              value={currentDeduction.amount}
              onChange={(e) => setCurrentDeduction({ ...currentDeduction, amount: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #3a3f55',
                background: '#1c2232',
                color: '#e1e8fc',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              onClick={() => {
                setDeductionModalOpen(false);
                setCurrentDeduction({ value: '', amount: '' });
                setEditingDeductionIndex(null);
              }}
              style={{
                background: '#1c2232',
                color: '#e1e8fc',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #3a3f55',
                fontWeight: 'bold',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddDeduction}
              style={{
                background: '#72caff',
                color: '#0f131f',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 'bold',
              }}
            >
              {editingDeductionIndex !== null ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <GlowingBox>
      <div className="deductions-step">
        <h2>
          <PiSymbol /> Any deductions to claim?
        </h2>
        <p>
          Deductions reduce your taxable income and may unlock a bigger refund.
          Choose “Standard” for simplicity, or “Itemized” to claim specific expenses.
        </p>

        <div className="deduction-type-toggle">
          <label>
            <input
              type="radio"
              name="deductionType"
              value="standard"
              checked={deductionType === 'standard'}
              onChange={(e) => setDeductionType(e.target.value)}
            />
            &nbsp; Standard Deduction
          </label>
          <label>
            <input
              type="radio"
              name="deductionType"
              value="itemized"
              checked={deductionType === 'itemized'}
              onChange={(e) => setDeductionType(e.target.value)}
            />
            &nbsp; Itemized Deductions
          </label>
        </div>

        {deductionType === 'itemized' && (
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
                className={`deduction-option ${selected.some((d) => d.value === value) ? 'selected' : ''}`}
                onClick={() => toggleDeduction(value)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') toggleDeduction(value);
                }}
                style={{
                  background: selected.some((d) => d.value === value) ? '#2a3248' : '#1c2232',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: selected.some((d) => d.value === value) ? '0 0 20px rgba(118, 198, 255, 0.5)' : '0 0 10px rgba(118, 198, 255, 0.1)',
                }}
              >
                {label} {selected.some((d) => d.value === value) && `($${selected.find((d) => d.value === value).amount})`}
              </li>
            ))}
          </ul>
        )}

        {renderDeductionModal()}

        <div className="step-buttons">
          {onBack && (
            <button type="button" onClick={onBack}>
              Back
            </button>
          )}
          <button type="button" onClick={handleSubmit}>
            Next
          </button>
        </div>
      </div>

      <style jsx>{`
        .deductions-step {
          color: #e1e8fc;
        }
        .deduction-type-toggle {
          margin: 1.5rem 0;
          display: flex;
          gap: 2rem;
        }
        .deduction-options {
          list-style: none;
          padding: 0;
          margin: 2rem 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .deduction-option {
          background: #1c2232;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 10px rgba(118, 198, 255, 0.1);
        }
        .deduction-option:hover {
          box-shadow: 0 0 15px rgba(118, 198, 255, 0.3);
        }
        .deduction-option.selected {
          background: #2a3248;
          box-shadow: 0 0 20px rgba(118, 198, 255, 0.5);
        }
        .step-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
        }
        button {
          background: #72caff;
          color: #0f131f;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          font-weight: bold;
        }
        .modal {
          z-index: 1000;
        }
        .input-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e1e8fc;
        }
        input, select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #3a3f55;
          background: #1c2232;
          color: #e1e8fc;
        }
        input:focus, select:focus {
          outline: none;
          border-color: #72caff;
          box-shadow: 0 0 4px #72caff;
        }
      `}</style>
    </GlowingBox>
  );
}

DeductionsCreditsStep.propTypes = {
  answers: PropTypes.object,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};