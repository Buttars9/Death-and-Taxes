import React, { useState } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox';
import TrustGenerator from "../../../components/estate/TrustGenerator";
import POAGenerator from "../../../components/estate/POAGenerator";
import DirectiveGenerator from "../../../components/estate/DirectiveGenerator";
import TODAffidavitStep from "../../../components/estate/TODAffidavitStep";
import HipaaReleaseStep from "../../../components/estate/HipaaReleaseStep";
import ExecutorLetterStep from "../../../components/estate/ExecutorLetterStep";
import { useWizardStore } from "../../../stores/wizardStore";

const estateOptions = [
  { key: 'trust', label: 'Revocable Living Trust', component: TrustGenerator },
  { key: 'poa', label: 'Power of Attorney', component: POAGenerator },
  { key: 'directive', label: 'Advance Directive', component: DirectiveGenerator },
  { key: 'tod', label: 'Transfer-on-Death Affidavit', component: TODAffidavitStep },
  { key: 'hipaa', label: 'HIPAA Release Authorization', component: HipaaReleaseStep },
  { key: 'executor', label: 'Executor Instruction Letter', component: ExecutorLetterStep },
];

function EstatePlanWizard({ onNext, onBack }) {
  const { answers, setAnswers } = useWizardStore();
  const allKeys = estateOptions.map(opt => opt.key);
  const initialKeys = answers.estatePlanSelections || allKeys;
  const [selectedKeys, setSelectedKeys] = useState(() =>
    allKeys.filter(k => initialKeys.includes(k))
  );
  const [index, setIndex] = useState(-1); // -1 means selection screen

  const handleToggle = (key) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleStart = () => {
    setAnswers({ ...answers, estatePlanSelections: selectedKeys });
    setIndex(0);
  };

  const handleNextStep = () => {
    if (index < selectedKeys.length - 1) {
      setIndex(index + 1);
    } else {
      onNext();
    }
  };

  const handleBackStep = () => {
    if (index > 0) {
      setIndex(index - 1);
    } else {
      setIndex(-1); // go back to selection screen
    }
  };

  // If user chose not to include estate plan, show notice and skip to payment
  if (!answers.includeEstatePlan) {
    return (
      <GlowingBox>
        <div className="credits-step">
          <div className="section">
            <h2>📁 No Estate Plan Added</h2>
            <p>
              You chose not to include the full estate plan ($25.00). Your total will reflect this. Click "Continue" to proceed to payment.
            </p>
            <div className="step-buttons">
              <button className="secondary" onClick={onBack}>Back</button>
              <button className="primary" onClick={onNext}>Continue</button>
            </div>
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
          button.secondary {
            background: #3a3f55;
            color: #e1e8fc;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            border: none;
            font-weight: bold;
          }
        `}</style>
      </GlowingBox>
    );
  }

  // Existing selection screen for estate plan documents
  if (index === -1) {
    return (
      <GlowingBox>
        <div className="credits-step">
          <div className="section">
            <h2>📁 Unselect Any Estate Documents You Don’t Want</h2>
            <ul className="credit-options">
              {estateOptions.map(opt => (
                <li
                  key={opt.key}
                  className={`credit-option ${selectedKeys.includes(opt.key) ? 'selected' : ''}`}
                  onClick={() => handleToggle(opt.key)}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
            <div className="step-buttons">
              <button className="secondary" onClick={onBack}>Back</button>
              <button className="primary" onClick={handleStart}>Continue</button>
            </div>
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
          button.secondary {
            background: #3a3f55;
            color: #e1e8fc;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            border: none;
            font-weight: bold;
          }
        `}</style>
      </GlowingBox>
    );
  }

  const currentKey = selectedKeys[index];
  const currentStep = estateOptions.find(opt => opt.key === currentKey)?.component;

  return React.createElement(currentStep, {
    onNext: handleNextStep,
    onBack: handleBackStep,
  });
}

EstatePlanWizard.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

export default EstatePlanWizard;