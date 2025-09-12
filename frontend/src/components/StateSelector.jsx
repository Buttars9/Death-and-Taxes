// death-and-taxes/src/pages/components/StateSelector.jsx

import React from 'react';
import { useWizardStore } from '../stores/wizardStore';

const STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

export default function StateSelector() {
  const state = useWizardStore((s) => s.state);
  const setState = useWizardStore((s) => s.setState);
  const setStateBranch = useWizardStore((s) => s.setStateBranch); // 🔀 branching trigger

  const handleChange = (e) => {
    const selected = e.target.value;
    setState(selected);

    // 🔀 Trigger state-specific branching logic
    switch (selected) {
      case 'California':
        setStateBranch('CA');
        break;
      case 'Texas':
        setStateBranch('TX');
        break;
      default:
        setStateBranch(null);
    }
  };

  return (
    <div className="state-selector">
      <label htmlFor="state">
        State <span style={{ color: '#f00' }}>*</span>
      </label>
      <select
        id="state"
        value={state}
        onChange={handleChange}
        className="glowing-select"
        required
      >
        <option value="">Select your state</option>
        {STATES.map((stateName) => (
          <option key={stateName} value={stateName}>
            {stateName}
          </option>
        ))}
      </select>
    </div>
  );
}