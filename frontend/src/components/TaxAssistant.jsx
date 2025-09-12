// death-and-taxes/src/components/TaxAssistant.jsx

import React, { useState } from 'react';
import { calculateRefund } from '../server/utils/refundEngine.js';
import { generateFinalWill } from '../server/utils/generateFinalWill.js';

export default function TaxAssistant() {
  const [filing, setFiling] = useState({
    name: '',
    state: '',
    filingStatus: 'single',
    income: 0,
    dependents: [],
    assets: [],
    employmentType: '',
    estate: {},
  });

  const [refund, setRefund] = useState(null);
  const [will, setWill] = useState(null);

  const handleInputChange = (field, value) => {
    setFiling(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    const refundResult = calculateRefund({
      state: filing.state,
      filingStatus: filing.filingStatus,
      income: filing.income,
      dependents: filing.dependents.length,
    });

    const willResult = generateFinalWill({
      ...filing,
      estate: {
        fullName: filing.name,
        primaryBeneficiary: filing.dependents[0] || '—',
        primaryBeneficiaryAge: '—',
        guardianName: '—',
        executor: filing.name,
        assetSummary: filing.assets.join(', '),
        finalWishes: '—',
      },
    });

    setRefund(refundResult);
    setWill(willResult);
  };

  return (
    <div className="tax-assistant">
      <h2>🧠 AI Tax Assistant</h2>

      <div className="input-group">
        <label>Name:</label>
        <input type="text" onChange={e => handleInputChange('name', e.target.value)} />
        <label>State:</label>
        <input type="text" onChange={e => handleInputChange('state', e.target.value)} />
        <label>Filing Status:</label>
        <select onChange={e => handleInputChange('filingStatus', e.target.value)}>
          <option value="single">Single</option>
          <option value="married">Married</option>
        </select>
        <label>Income:</label>
        <input type="number" onChange={e => handleInputChange('income', Number(e.target.value))} />
        <label>Assets (comma-separated):</label>
        <input type="text" onChange={e => handleInputChange('assets', e.target.value.split(','))} />
        <label>Dependents (comma-separated):</label>
        <input type="text" onChange={e => handleInputChange('dependents', e.target.value.split(','))} />
      </div>

      <button onClick={handleGenerate}>Generate Refund & Will</button>

      {refund && (
        <div className="refund-preview">
          <h3>💸 Refund Estimate</h3>
          <pre>{JSON.stringify(refund, null, 2)}</pre>
        </div>
      )}

      {will && (
        <div className="will-preview">
          <h3>📜 Will Preview</h3>
          <pre>{will.willText}</pre>
        </div>
      )}

      <style jsx>{`
        .tax-assistant {
          background: #0f131f;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(118, 198, 255, 0.3);
          color: #e1e8fc;
        }
        .input-group label {
          display: block;
          margin-top: 1rem;
        }
        input, select {
          width: 100%;
          padding: 0.5rem;
          margin-top: 0.25rem;
          background: #1c2230;
          border: none;
          border-radius: 6px;
          color: #e1e8fc;
        }
        button {
          margin-top: 2rem;
          padding: 0.75rem 1.5rem;
          background: #00ffe0;
          color: #0f131f;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
        pre {
          background: #1c2230;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}