import React from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../GlowingBox';
import { useWizardStore } from '../../stores/wizardStore';
import HelpIcon from '../HelpIcon';
import HelpModal from '../HelpModal';
import '../HelpIcon.css';

function ExecutorLetterStep({ onNext, onBack }) {
  const { answers, setAnswers } = useWizardStore();
  const executorData = answers.executorData || {};
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleChange = (field, value) => {
    const updated = { ...executorData, [field]: value };
    setAnswers({ ...answers, executorData: updated });
  };

  return (
    <GlowingBox>
      <div className="credits-step">
        <div className="section">
          <h2>📩 Executor Instruction Letter <HelpIcon onClick={() => { setSelectedTopic('executorLetterStep'); setShowHelpModal(true); }} /></h2>

          <div className="glowing-input">
            <label>Your Full Name</label>
            <input value={executorData.sender || ''} onChange={(e) => handleChange('sender', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>Executor Full Name</label>
            <input value={executorData.recipient || ''} onChange={(e) => handleChange('recipient', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>Jurisdiction</label>
            <input value={executorData.jurisdiction || ''} onChange={(e) => handleChange('jurisdiction', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>Special Instructions</label>
            <textarea value={executorData.instructions || ''} onChange={(e) => handleChange('instructions', e.target.value)} />
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

ExecutorLetterStep.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

export default ExecutorLetterStep;