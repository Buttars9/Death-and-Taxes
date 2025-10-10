import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useWizardStore } from '../stores/wizardStore';
import HelpIcon from '../../../components/HelpIcon';
import HelpModal from '../../../components/HelpModal';
import '../../../components/HelpIcon.css';

export default function WillGenerator({ onNext, onBack }) {
  const { answers, setAnswers } = useWizardStore();
const willData = answers.willData || {};
  const [age, setAge] = useState(willData.primaryBeneficiaryAge || '');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleChange = (field, value) => {
    const updated = { ...willData, [field]: value };
    if (field === 'primaryBeneficiaryAge') setAge(value);
    setAnswers({
  ...answers,
  willData: updated,
});
  };

  const isMinor = Number(age) < 18;
  const hasSensitiveAssets = willData.assetSummary?.match(/crypto|precious metals|IP|vault/i);
  const isComplexEstate =
    willData.assetSummary?.length > 500 ||
    willData.assetSummary?.match(/real estate|business|trust/i);

  return (
    <div className="will-generator">
      <h2 className="section-title">🪦 Final Will & Testament <HelpIcon onClick={() => { setSelectedTopic('willGeneratorStep'); setShowHelpModal(true); }} /></h2>

      <div className="glowing-input">
        <label>Full Legal Name</label>
        <input
          value={willData.fullName || ''}
          onChange={(e) => handleChange('fullName', e.target.value)}
        />
      </div>

      <div className="glowing-input">
        <label>Primary Beneficiary</label>
        <input
          value={willData.primaryBeneficiary || ''}
          onChange={(e) => handleChange('primaryBeneficiary', e.target.value)}
        />
      </div>

      <div className="glowing-input">
        <label>Beneficiary Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => handleChange('primaryBeneficiaryAge', e.target.value)}
        />
      </div>

      {isMinor && (
        <div className="glowing-input">
          <label>Guardian for Minor Beneficiary</label>
          <input
            value={willData.guardianName || ''}
            onChange={(e) => handleChange('guardianName', e.target.value)}
          />
        </div>
      )}

      <div className="glowing-input">
        <label>Contingent Beneficiary (if primary is deceased)</label>
        <input
          value={willData.contingentBeneficiary || ''}
          onChange={(e) => handleChange('contingentBeneficiary', e.target.value)}
        />
      </div>

      <div className="glowing-input">
        <label>Executor of Will</label>
        <input
          value={willData.executor || ''}
          onChange={(e) => handleChange('executor', e.target.value)}
        />
      </div>

      <div className="glowing-input">
        <label>Asset Summary</label>
        <textarea
          value={willData.assetSummary || ''}
          onChange={(e) => handleChange('assetSummary', e.target.value)}
        />
      </div>

      {hasSensitiveAssets && (
        <p className="trust-note">🔐 Assets flagged for blockchain anchoring and audit trail.</p>
      )}

      {isComplexEstate && (
        <p className="trust-note">
          ⚠️ Complex estate detected. Probate triggers may apply. Consider legal review.
        </p>
      )}

      {!willData.primaryBeneficiary && (
        <p className="trust-note">
          ⚠️ No beneficiary listed. Will may be invalid without fallback designation.
        </p>
      )}

      <div className="glowing-input">
        <label>Final Wishes</label>
        <textarea
          value={willData.finalWishes || ''}
          onChange={(e) => handleChange('finalWishes', e.target.value)}
        />
      </div>

      <div className="glowing-input">
        <label>Signature Date</label>
        <input
          type="date"
          value={willData.signatureDate || ''}
          onChange={(e) => handleChange('signatureDate', e.target.value)}
        />
      </div>

      <div className="glowing-input">
        <label>Jurisdiction (State or Country)</label>
        <input
          value={willData.jurisdiction || ''}
          onChange={(e) => handleChange('jurisdiction', e.target.value)}
        />
      </div>

      <div className="glowing-input">
        <label>Witness Names (comma-separated)</label>
        <input
          value={willData.witnesses || ''}
          onChange={(e) => handleChange('witnesses', e.target.value)}
        />
      </div>

      {willData.witnesses && (
        <p className="trust-note">
          ⚠️ A valid will must be signed in the presence of two witnesses. After printing, ensure both are present during signing. The printable version will include signature blocks for all parties.
        </p>
      )}

      <div className="glowing-input">
        <label>Revocation Clause</label>
        <select
          value={willData.revocationClause ? 'yes' : 'no'}
          onChange={(e) => handleChange('revocationClause', e.target.value === 'yes')}
        >
          <option value="yes">✅ I revoke all prior wills and codicils</option>
          <option value="no">❌ Do not include</option>
        </select>
      </div>

      <div className="glowing-input">
        <label>Residue Clause</label>
        <select
          value={willData.includeResidueClause ? 'yes' : 'no'}
          onChange={(e) => handleChange('includeResidueClause', e.target.value === 'yes')}
        >
          <option value="yes">✅ Include clause for unlisted assets</option>
          <option value="no">❌ Omit clause</option>
        </select>
      </div>

      <div className="glowing-input">
        <label>Digital Assets Clause</label>
        <select
          value={willData.includeDigitalAssetsClause ? 'yes' : 'no'}
          onChange={(e) => handleChange('includeDigitalAssetsClause', e.target.value === 'yes')}
        >
          <option value="yes">✅ Include clause for email, crypto, cloud</option>
          <option value="no">❌ Omit clause</option>
        </select>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: '#1c2232',
            color: '#e1e8fc',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #3a3f55',
            fontWeight: 'bold'
          }}
        >
          Back
        </button>
        <button
          className="primary"
          onClick={onNext}
          style={{
            background: '#72caff',
            color: '#0f131f',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          Next
        </button>
      </div>

      <style jsx>{`
        .will-generator {
          padding: 2rem;
          background: #0f131f;
          color: #e1e8fc;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(118, 198, 255, 0.3);
        }
        .section-title {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
        }
        .glowing-input {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
        }
        input,
        textarea,
        select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: none;
          background: #1c2232;
          color: #e1e8fc;
        }
        textarea {
          min-height: 80px;
        }
        .trust-note {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #ffcc66;
        }
      `}</style>
      {showHelpModal && (
        <HelpModal topic={selectedTopic} onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
}

WillGenerator.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};