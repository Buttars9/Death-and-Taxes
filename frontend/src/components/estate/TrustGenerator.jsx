import React, { useState } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../GlowingBox';
import { useWizardStore } from '../../stores/wizardStore';
import HelpIcon from '../HelpIcon';
import HelpModal from '../HelpModal';
import '../HelpIcon.css';

function TrustGenerator({ onNext, onBack }) {
  const { answers, setAnswers } = useWizardStore();
  const trustData = answers.trustData || {};
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleChange = (field, value) => {
    const updated = { ...trustData, [field]: value };
    setAnswers({ ...answers, trustData: updated });
  };

  return (
    <GlowingBox>
      <div className="credits-step">
        <div className="section">
          <h2>📜 Revocable Living Trust <HelpIcon onClick={() => { setSelectedTopic('trustGeneratorStep'); setShowHelpModal(true); }} /></h2>

          <div className="glowing-input">
            <label>Grantor Full Name</label>
            <input value={trustData.grantor || ''} onChange={(e) => handleChange('grantor', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>Trustee Name</label>
            <input value={trustData.trustee || ''} onChange={(e) => handleChange('trustee', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>Successor Trustee</label>
            <input value={trustData.successorTrustee || ''} onChange={(e) => handleChange('successorTrustee', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>Trust Beneficiaries</label>
            <input value={trustData.beneficiaries || ''} onChange={(e) => handleChange('beneficiaries', e.target.value)} />
          </div>

          <div className="glowing-input">
            <label>Special Provisions</label>
            <textarea value={trustData.specialTerms || ''} onChange={(e) => handleChange('specialTerms', e.target.value)} />
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

TrustGenerator.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

export default TrustGenerator;