import React, { useState } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../GlowingBox';
import { useWizardStore } from '../../stores/wizardStore';
import HelpIcon from '../HelpIcon';
import HelpModal from '../HelpModal';
import '../HelpIcon.css';

function POAGenerator({ onNext, onBack }) {
  const { answers, setAnswers } = useWizardStore();
  const poaData = answers.poaData || {};
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleChange = (field, value) => {
    const updated = { ...poaData, [field]: value };
    setAnswers({ ...answers, poaData: updated });
  };

  return (
    <GlowingBox>
      <div className="credits-step">
        <div className="section">
          <h2>🖋️ Power of Attorney <HelpIcon onClick={() => { setSelectedTopic('poaGeneratorStep'); setShowHelpModal(true); }} /></h2>

          <div className="glowing-input">
            <label>Principal Full Name</label>
            <input value={poaData.principal || ''} onChange={(e) => handleChange('principal', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>Agent Name</label>
            <input value={poaData.agent || ''} onChange={(e) => handleChange('agent', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>Scope of Authority</label>
            <textarea value={poaData.scope || ''} onChange={(e) => handleChange('scope', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>Effective Date</label>
            <input type="date" value={poaData.effectiveDate || ''} onChange={(e) => handleChange('effectiveDate', e.target.value)} />
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
      {showHelpModal && (
        <HelpModal topic={selectedTopic} onClose={() => setShowHelpModal(false)} />
      )}
    </GlowingBox>
  );
}

POAGenerator.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

export default POAGenerator;