import React from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../GlowingBox';
import { useWizardStore } from '../../stores/wizardStore';

function DirectiveGenerator({ onNext, onBack }) {
  const { answers, setAnswers } = useWizardStore();
  const directiveData = answers.directiveData || {};

  const handleChange = (field, value) => {
    const updated = { ...directiveData, [field]: value };
    setAnswers({ ...answers, directiveData: updated });
  };

  return (
    <GlowingBox>
      <div className="credits-step">
        <div className="section">
          <h2>🩺 Advance Directive</h2>

          <div className="glowing-input">
            <label>Full Name</label>
            <input value={directiveData.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>Medical Preferences</label>
            <textarea value={directiveData.preferences || ''} onChange={(e) => handleChange('preferences', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>End-of-Life Instructions</label>
            <textarea value={directiveData.endOfLife || ''} onChange={(e) => handleChange('endOfLife', e.target.value)} />
          </div>

          <div className="step-buttons">
            <button className="secondary" onClick={onBack}>Back</button>
            <button className="primary" onClick={onNext}>Next</button>
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
        .glowing-input {
          margin-bottom: 1.5rem;
        }
        .glowing-input label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        .glowing-input input,
        .glowing-input textarea {
          width: 100%;
          padding: 0.5rem;
          background: #1c2232;
          border: 1px solid #3a3f55;
          border-radius: 6px;
          color: #e1e8fc;
        }
        .glowing-input textarea {
          min-height: 100px;
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

DirectiveGenerator.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

export default DirectiveGenerator;