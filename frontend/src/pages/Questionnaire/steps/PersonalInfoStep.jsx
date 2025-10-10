import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox.jsx';
import PiSymbol from '../../../components/PiSymbol.jsx';
import { useWizardStore } from '../../../stores/wizardStore';
import HelpIcon from '../../../components/HelpIcon';
import HelpModal from '../../../components/HelpModal';
import '../../../components/HelpIcon.css';

const filingOptions = [
  { value: '', label: 'Select' },
  { value: 'single', label: 'Single' },
  { value: 'marriedJointly', label: 'Married Filing Jointly' },
  { value: 'marriedFilingSeparately', label: 'Married Filing Separately' },
  { value: 'headOfHousehold', label: 'Head of Household' },
  { value: 'qualifyingWidow', label: 'Qualifying Widow(er)' },
];

const incomeOptions = [
  { label: 'W-2 Employment', value: 'w2' },
  { label: 'Self-Employment (1099)', value: '1099' },
  { label: 'Unemployment Benefits', value: 'unemployment' },
  { label: 'Interest & Dividends', value: 'interest_dividends' },
  { label: 'Rental Income', value: 'rental' },
  { label: 'Retirement Income (401k, IRA)', value: 'retirement' },
  { label: 'Social Security Benefits', value: 'social_security' },
  { label: 'Crypto & Precious Metals', value: 'crypto_metals', pi: true },
  { label: 'Alimony Received', value: 'alimony' },
  { label: 'Gambling Winnings', value: 'gambling' },
  { label: 'Farm Income', value: 'farm' },
  { label: 'Foreign Income', value: 'foreign' },
  { label: 'Other', value: 'other' },
  { label: 'Clear All', value: 'clear_all', isClear: true },
];

const dependentOptions = [
  { label: 'Add Dependent', value: 'add_dependent' },
  { label: 'Clear All', value: 'clear_all', isClear: true },
];

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  'District of Columbia', 'Puerto Rico', 'Guam', 'American Samoa', 'U.S. Virgin Islands', 'Northern Mariana Islands'
];

export default function PersonalInfoStep({ answers, setAnswers, onNext, onBack }) {
  const {
    firstName,
    lastName,
    ssn,
    dob,
    address,
    maritalStatus,
    residentState,
    priorAGI,
    irsPin,
    incomeSources,
    dependents,
    spouseName,
    spouseSSN,
    spouseDob,
    updateField,
  } = useWizardStore();

  const [localFirstName, setLocalFirstName] = useState(answers.firstName || firstName || '');
  const [localLastName, setLocalLastName] = useState(answers.lastName || lastName || '');
  const [localSsn, setLocalSsn] = useState(answers.ssn || ssn || '');
  const [localDob, setLocalDob] = useState(answers.dob || dob || '');
  const [localAddress, setLocalAddress] = useState(answers.address || address || '');
  const [localMaritalStatus, setLocalMaritalStatus] = useState(answers.maritalStatus || maritalStatus || '');
  const [localResidentState, setLocalResidentState] = useState(answers.residentState || residentState || '');
  const [localPriorAGI, setLocalPriorAGI] = useState(answers.priorAGI || priorAGI || '');
  const [localIrsPin, setLocalIrsPin] = useState(answers.irsPin || irsPin || '');
  const [localIncomeSources, setLocalIncomeSources] = useState(answers.incomeSources || incomeSources || []);
  const [localSpouseIncomeSources, setLocalSpouseIncomeSources] = useState([]);
  const [localDependents, setLocalDependents] = useState(answers.dependents || dependents || []);
  const [localSpouseName, setLocalSpouseName] = useState(answers.spouseName || spouseName || '');
  const [localSpouseSSN, setLocalSpouseSSN] = useState(answers.spouseSSN || spouseSSN || '');
  const [localSpouseDob, setLocalSpouseDob] = useState(answers.spouseDob || spouseDob || '');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  useEffect(() => {
    setLocalFirstName(answers.firstName || firstName || '');
    setLocalLastName(answers.lastName || lastName || '');
    setLocalSsn(answers.ssn || ssn || '');
    setLocalDob(answers.dob || dob || '');
    setLocalAddress(answers.address || address || '');
    setLocalMaritalStatus(answers.maritalStatus || maritalStatus || '');
    setLocalResidentState(answers.residentState || residentState || '');
    setLocalPriorAGI(answers.priorAGI || priorAGI || '');
    setLocalIrsPin(answers.irsPin || irsPin || '');
    // FIX: Split incomeSources by owner to maintain user and spouse highlights
    const userIncomes = (answers.incomeSources || incomeSources || []).filter(s => s.owner === 'self' || !s.owner);
    const spouseIncomes = (answers.incomeSources || incomeSources || []).filter(s => s.owner === 'spouse');
    setLocalIncomeSources(userIncomes);
    setLocalSpouseIncomeSources(spouseIncomes);
    setLocalDependents(answers.dependents || dependents || []);
    setLocalSpouseName(answers.spouseName || spouseName || '');
    setLocalSpouseSSN(answers.spouseSSN || spouseSSN || '');
    setLocalSpouseDob(answers.spouseDob || spouseDob || '');
  }, [answers, firstName, lastName, ssn, dob, address, maritalStatus, residentState, priorAGI, irsPin, incomeSources, dependents, spouseName, spouseSSN, spouseDob]);

  const toggleIncome = (incomeType, owner = 'self') => {
    if (incomeType === 'clear_all') {
      const setSources = owner === 'self' ? setLocalIncomeSources : setLocalSpouseIncomeSources;
      setSources([]);
      return;
    }
    const setSources = owner === 'self' ? setLocalIncomeSources : setLocalSpouseIncomeSources;
    setSources((prev) => [...prev, { type: incomeType, owner }]);
  };

  const toggleDependent = (action) => {
    if (action === 'clear_all') {
      setLocalDependents([]);
      return;
    }
    if (action === 'add_dependent') {
  setLocalDependents((prev) => [...prev, { name: '', ssn: '', dob: '', relationship: '' }]);
}
  };

  const updateDependent = (index, field, value) => {
    const updated = [...localDependents];
    updated[index] = { ...updated[index], [field]: value };
    setLocalDependents(updated);
  };
const removeDependent = (index) => {
  const updated = [...localDependents];
  updated.splice(index, 1);
  setLocalDependents(updated);
};
  const handleSubmit = () => {
    try {
      const updatedAnswers = {
        firstName: localFirstName,
        lastName: localLastName,
        ssn: localSsn,
        dob: localDob,
        address: localAddress,
        maritalStatus: localMaritalStatus,
        residentState: localResidentState,
        priorAGI: localPriorAGI,
        irsPin: localIrsPin,
        incomeSources: [...localIncomeSources, ...localSpouseIncomeSources],
        dependents: localDependents,
        spouseName: localSpouseName,
        spouseSSN: localSpouseSSN,
        spouseDob: localSpouseDob,
      };
      console.log('Updated answers:', updatedAnswers);
      setAnswers(updatedAnswers);
      onNext();
    } catch (error) {
      console.error('Error in handleSubmit:', { message: error.message, stack: error.stack });
    }
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <GlowingBox>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
        <div style={{ flex: 2 }}>
          <h2 style={{ color: '#a166ff', marginBottom: '1rem' }}>
            <PiSymbol /> Personal Information <HelpIcon onClick={() => { console.log('HelpIcon clicked!'); setSelectedTopic('personalInfoStep'); setShowHelpModal(true); }} />
          </h2>
          <p>
            Fill in your details to start your filing. This information is required for accurate IRS filing.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
              <PiSymbol /> Your Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>First Name</label>
                <input
                  type="text"
                  value={localFirstName}
                  onChange={(e) => setLocalFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc',
                  }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>Last Name</label>
                <input
                  type="text"
                  value={localLastName}
                  onChange={(e) => setLocalLastName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc',
                  }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>Social Security Number</label>
                <input
                  type="text"
                  value={localSsn}
                  onChange={(e) => setLocalSsn(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc',
                  }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>Date of Birth</label>
                <input
                  type="date"
                  value={localDob}
                  onChange={(e) => setLocalDob(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc',
                  }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>Address</label>
                <input
                  type="text"
                  value={localAddress}
                  onChange={(e) => setLocalAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc',
                  }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>Filing Status</label>
                <select
                  value={localMaritalStatus}
                  onChange={(e) => setLocalMaritalStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc',
                  }}
                >
                  {filingOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>Resident State</label>
                <select
                  value={localResidentState}
                  onChange={(e) => setLocalResidentState(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc',
                  }}
                >
                  <option value="">Select</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>Prior Year AGI</label>
                <input
                  type="number"
                  value={localPriorAGI}
                  onChange={(e) => setLocalPriorAGI(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc',
                  }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>IRS PIN</label>
                <input
                  type="text"
                  value={localIrsPin}
                  onChange={(e) => setLocalIrsPin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc',
                  }}
                />
              </div>
            </div>
          </div>

          {localMaritalStatus === 'marriedJointly' && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
                <PiSymbol /> Spouse Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>Spouse Name</label>
                  <input
                    type="text"
                    value={localSpouseName}
                    onChange={(e) => setLocalSpouseName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #3a3f55',
                      background: '#1c2232',
                      color: '#e1e8fc',
                    }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>Spouse Social Security Number</label>
                  <input
                    type="text"
                    value={localSpouseSSN}
                    onChange={(e) => setLocalSpouseSSN(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #3a3f55',
                      background: '#1c2232',
                      color: '#e1e8fc',
                    }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc' }}>Spouse Date of Birth</label>
                  <input
                    type="date"
                    value={localSpouseDob}
                    onChange={(e) => setLocalSpouseDob(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #3a3f55',
                      background: '#1c2232',
                      color: '#e1e8fc',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
              <PiSymbol /> Dependents
            </h3>
            <p>
              Select 'Add Dependent' to add a dependent. You can add as many as you have. If you have none, skip this section.
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '2rem 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}>
              {dependentOptions.map(({ label, value, isClear }) => (
                <li
                  key={value}
                  className={`dependent-option ${!isClear && localDependents.length > 0 ? 'selected' : ''}`}
                  onClick={() => toggleDependent(value)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') toggleDependent(value);
                  }}
                  style={{
                    background: !isClear && localDependents.length > 0 ? '#2a3248' : '#1c2232',
                    padding: '1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: !isClear && localDependents.length > 0 ? '0 0 20px rgba(118, 198, 255, 0.5)' : '0 0 10px rgba(118, 198, 255, 0.1)',
                  }}
                >
                  {label} {!isClear && localDependents.length > 0 ? ` (${localDependents.length})` : ''}
                </li>
              ))}
            </ul>
           {localDependents.map((dep, i) => (
  <div key={i}>
    <div
      style={{
        marginBottom: '1rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '1rem',
      }}
    >
      {/* Name */}
      <div className="input-group">
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#e1e8fc',
            minHeight: '2rem',
            lineHeight: '1.5rem',
          }}
          htmlFor={`dependentName-${i}`}
        >
          Name
        </label>
        <input
          id={`dependentName-${i}`}
          type="text"
          value={dep.name || ''}
          onChange={(e) => updateDependent(i, 'name', e.target.value)}
          style={{
            width: '100%',
            height: '2.5rem',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #3a3f55',
            background: '#1c2232',
            color: '#e1e8fc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* SSN */}
      <div className="input-group">
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#e1e8fc',
            minHeight: '2rem',
            lineHeight: '1.5rem',
          }}
          htmlFor={`dependentSSN-${i}`}
        >
          SSN
        </label>
        <input
          id={`dependentSSN-${i}`}
          type="text"
          value={dep.ssn || ''}
          onChange={(e) => updateDependent(i, 'ssn', e.target.value)}
          style={{
            width: '100%',
            height: '2.5rem',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #3a3f55',
            background: '#1c2232',
            color: '#e1e8fc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Date of Birth */}
      <div className="input-group">
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#e1e8fc',
            minHeight: '2rem',
            lineHeight: '1.5rem',
          }}
          htmlFor={`dependentDob-${i}`}
        >
          Date of Birth
        </label>
        <input
          id={`dependentDob-${i}`}
          type="date"
          value={dep.dob || ''}
          onChange={(e) => updateDependent(i, 'dob', e.target.value)}
          style={{
            width: '100%',
            height: '2.5rem',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #3a3f55',
            background: '#1c2232',
            color: '#e1e8fc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Relationship */}
      <div className="input-group">
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#e1e8fc',
            minHeight: '2rem',
            lineHeight: '1.5rem',
          }}
          htmlFor={`dependentRelationship-${i}`}
        >
          Relationship
        </label>
        <input
          id={`dependentRelationship-${i}`}
          type="text"
          value={dep.relationship || ''}
          onChange={(e) => updateDependent(i, 'relationship', e.target.value)}
          style={{
            width: '100%',
            height: '2.5rem',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #3a3f55',
            background: '#1c2232',
            color: '#e1e8fc',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>

    <button
  type="button"
  onClick={() => removeDependent(i)}
  style={{
    background: '#1c2232',
    color: '#e1e8fc',
    border: '1px solid #3a3f55',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontWeight: '500',
    marginBottom: '1rem',
    cursor: 'pointer',
    boxShadow: '0 0 4px rgba(114, 202, 255, 0.3)',
    transition: 'background 0.2s ease',
  }}
  onMouseOver={(e) => (e.currentTarget.style.background = '#2a3042')}
  onMouseOut={(e) => (e.currentTarget.style.background = '#1c2232')}
>
  Remove
</button>
  </div>
))}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
              <PiSymbol /> Your Income Sources
            </h3>
            <p>
              Select all income types you received. Click a type multiple times if you have multiple sources (e.g., click W-2 twice if you have two W-2s). We’ll guide your refund path and match to IRS forms (e.g., W-2, 1099).
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '2rem 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}>
              {incomeOptions.map(({ label, value, pi, isClear }) => (
                <li
                  key={value}
                  className={`income-option ${!isClear && localIncomeSources.some(s => s.type === value) ? 'selected' : ''}`}
                  onClick={() => toggleIncome(value)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') toggleIncome(value);
                  }}
                  style={{
                    background: !isClear && localIncomeSources.some(s => s.type === value) ? '#2a3248' : '#1c2232',
                    padding: '1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: !isClear && localIncomeSources.some(s => s.type === value) ? '0 0 20px rgba(118, 198, 255, 0.5)' : '0 0 10px rgba(118, 198, 255, 0.1)',
                  }}
                >
                  {pi && !isClear && <PiSymbol />} {label} {!isClear && localIncomeSources.filter(s => s.type === value).length > 0 ? ` (${localIncomeSources.filter(s => s.type === value).length})` : ''}
                </li>
              ))}
            </ul>
          </div>

          {localMaritalStatus === 'marriedJointly' && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
                <PiSymbol /> Spouse Income Sources
              </h3>
              <p>
                Select all income types your spouse received. Click a type multiple times if they have multiple sources (e.g., click W-2 twice if they have two W-2s). These will be included in your joint filing.
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '2rem 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}>
                {incomeOptions.map(({ label, value, pi, isClear }) => (
                  <li
                    key={`spouse-${value}`}
                    className={`income-option ${!isClear && localSpouseIncomeSources.some(s => s.type === value) ? 'selected' : ''}`}
                    onClick={() => toggleIncome(value, 'spouse')}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') toggleIncome(value, 'spouse');
                    }}
                    style={{
                      background: !isClear && localSpouseIncomeSources.some(s => s.type === value) ? '#2a3248' : '#1c2232',
                      padding: '1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: !isClear && localSpouseIncomeSources.some(s => s.type === value) ? '0 0 20px rgba(118, 198, 255, 0.5)' : '0 0 10px rgba(118, 198, 255, 0.1)',
                    }}
                  >
                    {pi && !isClear && <PiSymbol />} {isClear ? label : `Spouse ${label}`} {!isClear && localSpouseIncomeSources.filter(s => s.type === value).length > 0 ? ` (${localSpouseIncomeSources.filter(s => s.type === value).length})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {onBack && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  background: '#1c2232',
                  color: '#e1e8fc',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #3a3f55',
                  fontWeight: 'bold',
                }}
              >
                Back
              </button>
            )}
            <button
              className="primary"
              onClick={handleSubmit}
              style={{
                background: '#72caff',
                color: '#0f131f',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 'bold',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {showHelpModal && (
        <HelpModal topic={selectedTopic} onClose={() => setShowHelpModal(false)} />
      )}
    </GlowingBox>
  );
}

PersonalInfoStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};