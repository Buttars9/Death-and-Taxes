import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GlowingBox from '../../../components/GlowingBox.jsx';
import PiSymbol from '../../../components/PiSymbol.jsx';
import { useWizardStore } from '../../../stores/wizardStore';

const filingOptions = [
  { value: '', label: 'Select' },
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'head', label: 'Head of Household' },
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
    setLocalIncomeSources(answers.incomeSources || incomeSources || []);
    setLocalSpouseIncomeSources([]);
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
      setLocalDependents((prev) => [...prev, { name: '', ssn: '', dob: '' }]);
    }
  };

  const updateDependent = (index, field, value) => {
    const updated = [...localDependents];
    updated[index] = { ...updated[index], [field]: value };
    setLocalDependents(updated);
  };

  const handleSubmit = () => {
    console.log('handleSubmit triggered, onNext:', typeof onNext, 'onNext exists:', !!onNext);
    try {
      const payload = {
        firstName: localFirstName || null,
        lastName: localLastName || null,
        ssn: localSsn || null,
        dob: localDob || null,
        address: localAddress || null,
        maritalStatus: localMaritalStatus || null,
        residentState: localResidentState || null,
        priorAGI: localPriorAGI ? Number(localPriorAGI) : null,
        irsPin: localIrsPin || null,
        incomeSources: [...localIncomeSources, ...localSpouseIncomeSources],
        dependents: localDependents.filter(dep => dep.name || dep.ssn || dep.dob),
        spouseName: localMaritalStatus === 'married' ? localSpouseName || null : null,
        spouseSSN: localMaritalStatus === 'married' ? localSpouseSSN || null : null,
        spouseDob: localMaritalStatus === 'married' ? localSpouseDob || null : null,
      };
      console.log('Payload to setAnswers:', payload);
      if (setAnswers && typeof setAnswers === 'function') {
        setAnswers(payload);
      } else {
        console.error('setAnswers is not a function or undefined');
        alert('setAnswers is not available. Check wizardStore configuration.');
        return;
      }
      updateField('firstName', localFirstName || null);
      updateField('lastName', localLastName || null);
      updateField('ssn', localSsn || null);
      updateField('dob', localDob || null);
      updateField('address', localAddress || null);
      updateField('maritalStatus', localMaritalStatus || null);
      updateField('residentState', localResidentState || null);
      updateField('priorAGI', localPriorAGI ? Number(localPriorAGI) : null);
      updateField('irsPin', localIrsPin || null);
      updateField('incomeSources', [...localIncomeSources, ...localSpouseIncomeSources]);
      updateField('dependents', localDependents.filter(dep => dep.name || dep.ssn || dep.dob));
      updateField('spouseName', localMaritalStatus === 'married' ? localSpouseName || null : null);
      updateField('spouseSSN', localMaritalStatus === 'married' ? localSpouseSSN || null : null);
      updateField('spouseDob', localMaritalStatus === 'married' ? localSpouseDob || null : null);
      if (onNext && typeof onNext === 'function') {
        console.log('Calling onNext');
        onNext();
      } else {
        console.warn('onNext is not a function or null');
        alert('Next action is not available. Check wizard configuration.');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('An error occurred. Check console for details.');
    }
  };

  const handleBack = () => {
    console.log('handleBack triggered, onBack:', typeof onBack, 'onBack exists:', !!onBack);
    if (onBack && typeof onBack === 'function') {
      console.log('Calling onBack');
      onBack();
    } else {
      console.warn('onBack is not a function or null');
      alert('Back action is not available. Check wizard configuration.');
    }
  };

  return (
    <GlowingBox>
      <div style={{
        color: '#e1e8fc',
        padding: '2rem'
      }}>
        <h2 style={{ color: '#a166ff' }}>
          <PiSymbol /> Personal Information
        </h2>
        <p>
          Enter your personal and dependent details for IRS Form 1040, e-filing, and will preparation.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
            <PiSymbol /> Basic Info
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
              alignItems: 'start',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={localFirstName}
                onChange={(e) => setLocalFirstName(e.target.value)}
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
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={localLastName}
                onChange={(e) => setLocalLastName(e.target.value)}
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
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="ssn">SSN</label>
              <input
                id="ssn"
                type="text"
                value={localSsn}
                onChange={(e) => setLocalSsn(e.target.value)}
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
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                type="date"
                value={localDob}
                onChange={(e) => setLocalDob(e.target.value)}
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
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                value={localAddress}
                onChange={(e) => setLocalAddress(e.target.value)}
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
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="maritalStatus">Filing Status</label>
              <select
                id="maritalStatus"
                value={localMaritalStatus}
                onChange={(e) => setLocalMaritalStatus(e.target.value)}
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
              >
                {filingOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="residentState">Resident State</label>
              <select
                id="residentState"
                value={localResidentState}
                onChange={(e) => setLocalResidentState(e.target.value)}
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
              >
                <option value="">Select</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="priorAGI">Prior Year AGI</label>
              <input
                id="priorAGI"
                type="number"
                value={localPriorAGI}
                onChange={(e) => setLocalPriorAGI(e.target.value)}
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
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="irsPin">IRS Identity Protection PIN (if issued)</label>
              <input
                id="irsPin"
                type="text"
                value={localIrsPin}
                onChange={(e) => setLocalIrsPin(e.target.value)}
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
          {localMaritalStatus === 'married' && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#a166ff', marginBottom: '1rem' }}>
                <PiSymbol /> Spouse Info
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.5rem',
                  alignItems: 'start',
                }}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="spouseName">Spouse Name</label>
                  <input
                    id="spouseName"
                    type="text"
                    value={localSpouseName}
                    onChange={(e) => setLocalSpouseName(e.target.value)}
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
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="spouseSSN">Spouse SSN</label>
                  <input
                    id="spouseSSN"
                    type="text"
                    value={localSpouseSSN}
                    onChange={(e) => setLocalSpouseSSN(e.target.value)}
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
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor="spouseDob">Spouse Date of Birth</label>
                  <input
                    id="spouseDob"
                    type="date"
                    value={localSpouseDob}
                    onChange={(e) => setLocalSpouseDob(e.target.value)}
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
            </div>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#a166ff', marginBottom: '1rem' }}>
            <PiSymbol /> Dependents
          </h3>
          <p>
            Click "Add Dependent" to include dependents who may qualify you for credits like Child Tax Credit. Click multiple times for multiple dependents.
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
                className={`dependent-option ${!isClear && localDependents.length > 0 && value === 'add_dependent' ? 'selected' : ''}`}
                onClick={() => toggleDependent(value)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') toggleDependent(value);
                }}
                style={{
                  background: !isClear && localDependents.length > 0 && value === 'add_dependent' ? '#2a3248' : '#1c2232',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: !isClear && localDependents.length > 0 && value === 'add_dependent' ? '0 0 20px rgba(118, 198, 255, 0.5)' : '0 0 10px rgba(118, 198, 255, 0.1)',
                }}
              >
                {label} {!isClear && value === 'add_dependent' && localDependents.length > 0 ? ` (${localDependents.length})` : ''}
              </li>
            ))}
          </ul>
          {localDependents.map((dep, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                margin: '1rem 0'
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor={`dependentName-${i}`}>Name</label>
                <input
                  id={`dependentName-${i}`}
                  type="text"
                  value={dep.name || ''}
                  onChange={(e) => updateDependent(i, 'name', e.target.value)}
                  placeholder="Full name"
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor={`dependentSSN-${i}`}>SSN</label>
                <input
                  id={`dependentSSN-${i}`}
                  type="text"
                  value={dep.ssn || ''}
                  onChange={(e) => updateDependent(i, 'ssn', e.target.value)}
                  placeholder="123-45-6789"
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e1e8fc', minHeight: '2rem', lineHeight: '1.5rem' }} htmlFor={`dependentDob-${i}`}>Date of Birth</label>
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

        {localMaritalStatus === 'married' && (
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
    </GlowingBox>
  );
}

PersonalInfoStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};