import React, { useState } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../GlowingBox';
import { useWizardStore } from '../../stores/wizardStore';
import HelpIcon from '../HelpIcon';
import HelpModal from '../HelpModal';
import '../HelpIcon.css';

const todSupportedStates = ['AZ', 'CA', 'CO', 'IN', 'MO', 'NV', 'OH', 'TX', 'WI'];

function TODAffidavitStep({ onNext, onBack }) {
  const { answers, setAnswers } = useWizardStore();
  const todData = answers.todAffidavitData || {};
  const jurisdiction = answers.willData?.jurisdiction || '';
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const isSupported = todSupportedStates.includes(jurisdiction.toUpperCase());

  const handleChange = (field, value) => {
    const updated = { ...todData, [field]: value };
    setAnswers({ ...answers, todAffidavitData: updated });
  };

  return (
    <GlowingBox>
      <div className="credits-step">
        <div className="section">
          <h2>🏛️ Transfer-on-Death Affidavit <HelpIcon onClick={() => { setSelectedTopic('todAffidavitStep'); setShowHelpModal(true); }} /></h2>

          {!isSupported ? (
            <p style={{ color: '#ffcc66' }}>
              TOD affidavits are not supported in your jurisdiction (<strong>{jurisdiction}</strong>). This step will be skipped.
            </p>
          ) : (
            <>
              <div className="glowing-input">
                <label>Asset Type</label>
                <input value={todData.assetType || ''} onChange={(e) => handleChange('assetType', e.target.value)} />
              </div>

              <div className="glowing-input">
                <label>Beneficiary Name</label>
                <input value={todData.beneficiary || ''} onChange={(e) => handleChange('beneficiary', e.target.value)} />
              </div>

              <div className="glowing-input">
                <label>Owner Name</label>
                <input value={todData.owner || ''} onChange={(e) => handleChange('owner', e.target.value)} />
              </div>
            </>
          )}

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
        .glowing-input input {
          width: 100%;
          padding: 0.5rem;
          background: #1c2232;
          border: 1px solid #3a3f55;
          border-radius: 6px;
          color: #e1e8fc;
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

TODAffidavitStep.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

export default TODAffidavitStep;