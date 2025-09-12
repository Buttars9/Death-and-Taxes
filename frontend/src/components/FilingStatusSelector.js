import React from 'react';
import { useWizardStore } from '../stores/wizardStore';

const FILING_STATUSES = ['single', 'married', 'headOfHousehold'];

/**
 * Filing status selector for guided intake.
 * Syncs with wizardStore and supports validation.
 */

export default function FilingStatusSelector() {
  const answers = useWizardStore((s) => s.answers);
  const setAnswers = useWizardStore((s) => s.setAnswers);

  const handleChange = (e) => {
    const selected = e.target.value;
    setAnswers({ ...answers, filingStatus: selected });
  };

  return (
    <div className="filing-status-selector">
      <label htmlFor="filingStatus">
        Filing Status <span style={{ color: '#f00' }}>*</span>
      </label>

      <select
        id="filingStatus"
        value={answers.filingStatus || ''}
        onChange={handleChange}
        className="glowing-select"
        required
        aria-required="true"
      >
        <option value="">Select your filing status</option>
        {FILING_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}