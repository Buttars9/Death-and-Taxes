import React, { useState } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox';
import steps from '../../../wizard/wizardStep'; // Import wizardStep.js
import HelpIcon from '../../../components/HelpIcon';
import HelpModal from '../../../components/HelpModal';
import '../../../components/HelpIcon.css';

function EstatePlanOfferStep({ answers, setAnswers, onNext, onBack }) {
  const currentStep = steps.find((step) => step.key === 'estate-offer');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleChoice = (include) => {
    setAnswers({ ...answers, includeEstatePlan: include }, () => {
      const nextKey = typeof currentStep.next === 'function' 
        ? currentStep.next({ ...answers, includeEstatePlan: include }) 
        : currentStep.next;
      onNext(nextKey);
    });
  };

  return (
    <GlowingBox>
      <div className="credits-step">
        <div className="section">
          <h2>🧾 Add Full Estate Plan? <HelpIcon onClick={() => { setSelectedTopic('estatePlanOfferStep'); setShowHelpModal(true); }} /></h2>
          <p>
            You’ve completed your will. For an additional <strong>$25.00</strong>, you can generate a full estate plan including:
          </p>

          <ul className="credit-options">
            {[
              'Revocable Living Trust',
              'Power of Attorney',
              'Advance Directive',
              'HIPAA Release',
              'Transfer-on-Death Affidavits (state-specific)',
              'Executor Instruction Letter',
            ].map((label, i) => (
              <li key={i} className="credit-option">
                ✅ {label}
              </li>
            ))}
          </ul>

          <p>Would you like to add this to your filing?</p>

          <div className="step-buttons">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
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
              className="primary"
              onClick={() => handleChoice(true)}
            >
              Yes, Add Estate Plan
            </button>

            <button
              className="secondary"
              onClick={() => handleChoice(false)}
            >
              No, Continue
            </button>
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
          cursor: default;
          box-shadow: 0 0 10px rgba(118, 198, 255, 0.1);
          transition: box-shadow 0.2s ease;
        }
        .credit-option:hover {
          box-shadow: 0 0 15px rgba(118, 198, 255, 0.3);
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
      {showHelpModal && (
        <HelpModal topic={selectedTopic} onClose={() => setShowHelpModal(false)} />
      )}
    </GlowingBox>
  );
}

EstatePlanOfferStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

export default EstatePlanOfferStep;