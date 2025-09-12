// death-and-taxes/src/pages/Questionnaire/steps/WithholdingStep.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox';
import PiSymbol from '../../../components/PiSymbol';

export default function WithholdingStep({ answers, setAnswers, onNext, onBack }) {
  const [withheld, setWithheld] = useState(answers.taxWithheld || '');
  const [estimated, setEstimated] = useState(answers.estimatedPayments || '');

  useEffect(() => {
    setWithheld(answers.taxWithheld || '');
    setEstimated(answers.estimatedPayments || '');
  }, [answers]);

  const isValid =
    withheld !== '' &&
    estimated !== '' &&
    !isNaN(withheld) &&
    !isNaN(estimated);

  const handleSubmit = () => {
    if (!isValid) return;

    setAnswers((prev) => ({
      ...prev,
      taxWithheld: Number(withheld),
      estimatedPayments: Number(estimated),
    }));
    onNext();
  };

  return (
    <GlowingBox>
      <div className="withholding-step">
        <h2>
          <PiSymbol /> Tax Payments Made
        </h2>
        <p>
          Enter the total federal tax withheld from your paychecks and any estimated payments you made.
          These reduce your tax owed and may increase your refund.
        </p>

        <div className="input-group">
          <label htmlFor="taxWithheld">Federal Tax Withheld</label>
          <input
            id="taxWithheld"
            type="number"
            value={withheld}
            onChange={(e) => setWithheld(e.target.value)}
            placeholder="e.g. 4500"
          />
        </div>

        <div className="input-group">
          <label htmlFor="estimatedPayments">Estimated Payments Made</label>
          <input
            id="estimatedPayments"
            type="number"
            value={estimated}
            onChange={(e) => setEstimated(e.target.value)}
            placeholder="e.g. 2000"
          />
        </div>

        <div className="step-buttons">
          {onBack && <button onClick={onBack}>Back</button>}
          <button className="primary" onClick={handleSubmit} disabled={!isValid}>
            Next
          </button>
        </div>
      </div>

      <style jsx>{`
        .withholding-step {
          color: #e1e8fc;
        }
        .input-group {
          margin-bottom: 1.5rem;
        }
        input {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: none;
          background: #1c2232;
          color: #e1e8fc;
        }
        .step-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
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
        }
      `}</style>
    </GlowingBox>
  );
}

WithholdingStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};