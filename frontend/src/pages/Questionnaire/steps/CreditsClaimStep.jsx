import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PiSymbol from "../../../components/PiSymbol.jsx";

const creditOptions = [
  { label: 'Child Tax Credit', value: 'child_tax' },
  { label: 'Earned Income Tax Credit (EITC)', value: 'eitc' },
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

export default function CreditsClaimStep({ answers, setAnswers, onNext, onBack }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected(answers?.credits ?? []);
  }, [answers]);

  const toggleCredit = (value) => {
    const updated = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    setSelected(updated);
  };

  const handleSubmit = () => {
    setAnswers((prev) => ({
      ...prev,
      credits: selected,
    }));
    onNext();
  };

  return (
    <GlowingBox>
      <div className="credits-step">
        <h2>
          <PiSymbol /> Any tax credits to claim?
        </h2>
        <p>
          Credits directly reduce your tax bill—dollar for dollar. Some even trigger refunds.
          We’ll apply the latest IRS rules to maximize your benefit.
        </p>

        <ul className="credit-options">
          {creditOptions.map(({ label, value }) => (
            <li
              key={value}
              className={`credit-option ${selected.includes(value) ? 'selected' : ''}`}
              onClick={() => toggleCredit(value)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') toggleCredit(value);
              }}
            >
              {label}
            </li>
          ))}
        </ul>

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
        .credits-step {
          color: #e1e8fc;
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
      `}</style>
    </GlowingBox>
  );
}

CreditsClaimStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};