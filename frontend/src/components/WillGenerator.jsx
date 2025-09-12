// death-and-taxes/frontend/src/components/WillGenerator.jsx

import React, { useState } from 'react';
import { useWizardStore } from '../stores/wizardStore';

export default function WillGenerator() {
  const { willData, setWillData } = useWizardStore();
  const [age, setAge] = useState(willData.primaryBeneficiaryAge || '');

  const handleChange = (field, value) => {
    const updated = { ...willData, [field]: value };
    if (field === 'primaryBeneficiaryAge') setAge(value);
    setWillData(updated);
  };

  const isMinor = Number(age) < 18;
  const hasSensitiveAssets = willData.assetSummary?.match(/crypto|precious metals|IP|vault/i);
  const isComplexEstate =
    willData.assetSummary?.length > 500 ||
    willData.assetSummary?.match(/real estate|business|trust/i);

  return (
    <div className="will-generator">
      <h2 className="section-title">🪦 Final Will & Testament</h2>

      <div className="glowing-input">
        <label>Full Legal Name</label>
        <input
          value={willData.fullName || ''}
          onChange={(e) => handleChange('fullName', e.target.value)}
          required
        />
      </div>

      <div className="glowing-input">
        <label>Primary Beneficiary</label>
        <input
          value={willData.primaryBeneficiary || ''}
          onChange={(e) => handleChange('primaryBeneficiary', e.target.value)}
          required
        />
      </div>

      <div className="glowing-input">
        <label>Beneficiary Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => handleChange('primaryBeneficiaryAge', e.target.value)}
          required
        />
      </div>

      {isMinor && (
        <div className="glowing-input">
          <label>Guardian for Minor Beneficiary</label>
          <input
            value={willData.guardianName || ''}
            onChange={(e) => handleChange('guardianName', e.target.value)}
            required
          />
        </div>
      )}

      <div className="glowing-input">
        <label>Executor of Will</label>
        <input
          value={willData.executor || ''}
          onChange={(e) => handleChange('executor', e.target.value)}
          required
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
        textarea {
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
    </div>
  );
}