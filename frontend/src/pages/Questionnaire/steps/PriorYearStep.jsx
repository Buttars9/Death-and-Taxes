import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox';
import PiSymbol from '../../../components/PiSymbol';
import HelpIcon from '../../../components/HelpIcon';
import HelpModal from '../../../components/HelpModal';
import '../../../components/HelpIcon.css';

export default function PriorYearStep({ answers, setAnswers, onNext, onBack }) {
  const [priorAGI, setPriorAGI] = useState('');
  const [irsPin, setIrsPin] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  useEffect(() => {
    setPriorAGI(answers.priorAGI || '');
    setIrsPin(answers.irsPin || '');
  }, [answers]);

  // New: Save local fields to store on change (debounced for performance)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnswers({ ...answers, priorAGI: Number(priorAGI), irsPin: irsPin || null });
    }, 500); // Debounce by 500ms
    return () => clearTimeout(timer);
  }, [priorAGI, irsPin, answers, setAnswers]);

  const isValid = priorAGI !== '' && !isNaN(priorAGI);

  const handleSubmit = () => {
    if (!isValid || typeof setAnswers !== 'function') return;

    setAnswers({
      ...answers,
      priorAGI: Number(priorAGI),
      irsPin: irsPin || null,
    });
    onNext();
  };

  return (
    <>
      <style>{`
        .prior-year-step {
          color: #e1e8fc;
        }
        .input-group {
          margin-bottom: 1.5rem;
        }
        .input-group input {
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
        .next-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .input-group {
            margin-bottom: 1rem;
          }
          .input-group input {
            padding: 0.4rem;
          }
          .step-buttons {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            margin-top: 1.5rem;
          }
          .back-button,
          .next-button {
            width: 100%;
            padding: 0.75rem;
          }
        }
      `}</style>
      <GlowingBox>
        <div className="prior-year-step">
          <h2 className="h2-title">
            <PiSymbol /> Prior Year Info <HelpIcon onClick={() => { setSelectedTopic('priorYearStep'); setShowHelpModal(true); }} />
          </h2>
          <p className="description">
            The IRS uses your prior year AGI or PIN to verify your identity for e-file.
            If you don’t have a PIN, leave it blank.
          </p>

          <div className="input-group">
            <label htmlFor="priorAGI">Prior Year AGI</label>
            <input
              id="priorAGI"
              type="number"
              value={priorAGI}
              onChange={(e) => setPriorAGI(e.target.value)}
              placeholder="e.g. 52000"
            />
          </div>

          <div className="input-group">
            <label htmlFor="irsPin">IRS PIN (optional)</label>
            <input
              id="irsPin"
              type="text"
              value={irsPin}
              onChange={(e) => setIrsPin(e.target.value)}
              placeholder="6-digit PIN"
            />
          </div>

          <div className="step-buttons">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="back-button"
              >
                Back
              </button>
            )}
            <button className="next-button" onClick={handleSubmit} disabled={!isValid}>
              Next
            </button>
          </div>
        </div>
        {showHelpModal && (
          <HelpModal topic={selectedTopic} onClose={() => setShowHelpModal(false)} />
        )}
      </GlowingBox>
    </>
  );
}

PriorYearStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};