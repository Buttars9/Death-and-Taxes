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
    spouseName,
    spouseSSN,
    spouseDob,
    spouseIncomeSources,
    updateField,
  } = useWizardStore();

  const [localFirstName, setLocalFirstName] = useState(answers.firstName || firstName || '');
  const [localLastName, setLocalLastName] = useState(answers.lastName || lastName || '');
  const [localSsn, setLocalSsn] = useState(answers.ssn || ssn || '');
  const [localDob, setLocalDob] = useState(answers.dob || dob || '');
  const [localAddress, setLocalAddress] = useState(answers.address || address || '');
  const [localCity, setLocalCity] = useState(answers.city || ''); // Added for city
  const [localZip, setLocalZip] = useState(answers.zip || ''); // Added for ZIP
  const [localMaritalStatus, setLocalMaritalStatus] = useState(answers.maritalStatus || maritalStatus || '');
  const [localResidentState, setLocalResidentState] = useState(answers.residentState || residentState || '');
  const [localPriorAGI, setLocalPriorAGI] = useState(answers.priorAGI || priorAGI || '');
  const [localIrsPin, setLocalIrsPin] = useState(answers.irsPin || irsPin || '');
  const [localIncomeSources, setLocalIncomeSources] = useState(answers.incomeSources || incomeSources || []);
  const [localSpouseIncomeSources, setLocalSpouseIncomeSources] = useState([]);
  const [localDependents, setLocalDependents] = useState(answers.dependents || []);
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
    setLocalCity(answers.city || ''); // Added
    setLocalZip(answers.zip || ''); // Added
    setLocalMaritalStatus(answers.maritalStatus || maritalStatus || '');
    setLocalResidentState(answers.residentState || residentState || '');
    setLocalPriorAGI(answers.priorAGI || priorAGI || '');
    setLocalIrsPin(answers.irsPin || irsPin || '');
    // FIX: Split incomeSources by owner to maintain user and spouse highlights
    const userIncomes = (answers.incomeSources || incomeSources || []).filter(s => s.owner === 'self' || !s.owner);
    const spouseIncomes = (answers.incomeSources || incomeSources || []).filter(s => s.owner === 'spouse');
    setLocalIncomeSources(userIncomes);
    setLocalSpouseIncomeSources(spouseIncomes);
    setLocalDependents(answers.dependents || []);
    setLocalSpouseName(answers.spouseName || spouseName || '');
    setLocalSpouseSSN(answers.spouseSSN || spouseSSN || '');
    setLocalSpouseDob(answers.spouseDob || spouseDob || '');
  }, [answers, firstName, lastName, ssn, dob, address, maritalStatus, residentState, priorAGI, irsPin, incomeSources, spouseName, spouseSSN, spouseDob]);

  // New: Save localDependents to store on change (debounced for performance)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnswers({ ...answers, dependents: localDependents });
    }, 500); // Debounce by 500ms
    return () => clearTimeout(timer);
  }, [localDependents, answers, setAnswers]);

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
      setLocalDependents((prev) => [...prev, { firstName: '', lastName: '', ssn: '', dob: '', relationship: '' }]); // Split name, uppercase relationship
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
        city: localCity, // Added
        zip: localZip, // Added
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
    <>
      <style>{`
        .flex-row {
          display: flex;
          flex-direction: row;
          gap: 2rem;
        }
        .flex-2 {
          flex: 2;
        }
        .h2-title {
          color: #a166ff;
          margin-bottom: 1rem;
        }
        .p-description {
          margin-bottom: 2rem;
        }
        .h3-subtitle {
          color: #a166ff;
          margin-bottom: 1rem;
        }
        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e1e8fc;
        }
        .input-group input,
        .input-group select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #3a3f55;
          background: #1c2232;
          color: #e1e8fc;
        }
        .option-list {
          list-style: none;
          padding: 0;
          margin: 2rem 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .option-item {
          background: #1c2232;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          box-shadow: 0 0 10px rgba(118, 198, 255, 0.1);
        }
        .option-item.selected {
          background: #2a3248;
          box-shadow: 0 0 20px rgba(118, 198, 255, 0.5);
        }
        .dependent-grid {
          margin-bottom: 1rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }
        .dependent-label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e1e8fc;
          min-height: 2rem;
          line-height: 1.5rem;
        }
        .dependent-input {
          width: 100%;
          height: 2.5rem;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #3a3f55;
          background: #1c2232;
          color: #e1e8fc;
          box-sizing: border-box;
        }
        .remove-button {
          background: #1c2232;
          color: #e1e8fc;
          border: 1px solid #3a3f55;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-weight: 500;
          margin-bottom: 1rem;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(114, 202, 255, 0.3);
          transition: background 0.2s ease;
        }
        .remove-button:hover {
          background: #2a3042;
        }
        .flex-space-between {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
        }
        .back-button {
          background: #1c2232;
          color: #e1e8fc;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: 1px solid #3a3f55;
          font-weight: bold;
        }
        .next-button {
          background: #72caff;
          color: #0f131f;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          font-weight: bold;
        }
        @media (max-width: 768px) {
          .flex-row {
            flex-direction: column;
            gap: 1rem;
          }
          .h2-title {
            font-size: 1.5rem;
            margin-bottom: 0.75rem;
          }
          .h3-subtitle {
            font-size: 1.2rem;
            margin-bottom: 0.75rem;
          }
          .grid-2-col {
            grid-template-columns: 1fr;
          }
          .option-list {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 0.75rem;
            margin: 1.5rem 0;
          }
          .option-item {
            padding: 0.75rem;
            font-size: 0.9rem;
          }
          .dependent-grid {
            grid-template-columns: 1fr;
          }
          .input-group input,
          .input-group select {
            padding: 0.4rem;
          }
          .p-description {
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
          }
          .flex-space-between {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }
          .back-button,
          .next-button {
            width: 100%;
            padding: 0.75rem;
          }
        }
      `}</style>
      <GlowingBox>
        <div className="flex-row">
          <div className="flex-2">
            <h2 className="h2-title">
              <PiSymbol /> Personal Information <HelpIcon onClick={() => { setSelectedTopic('personalInfoStep'); setShowHelpModal(true); }} />
            </h2>
            <p>
              Fill in your details to start your filing. This information is required for accurate IRS filing.
            </p>

            <div className="p-description">
              <h3 className="h3-subtitle">
                <PiSymbol /> Your Information
              </h3>
              <div className="grid-2-col">
                <div className="input-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={localFirstName}
                    onChange={(e) => setLocalFirstName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={localLastName}
                    onChange={(e) => setLocalLastName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Social Security Number</label>
                  <input
                    type="text"
                    value={localSsn}
                    onChange={(e) => setLocalSsn(e.target.value)}
                    pattern="\d{9}"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={localDob}
                    onChange={(e) => setLocalDob(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    value={localAddress}
                    onChange={(e) => setLocalAddress(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={localCity}
                    onChange={(e) => setLocalCity(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    value={localZip}
                    onChange={(e) => setLocalZip(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Filing Status</label>
                  <select
                    value={localMaritalStatus}
                    onChange={(e) => setLocalMaritalStatus(e.target.value)}
                  >
                    {filingOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Resident State</label>
                  <select
                    value={localResidentState}
                    onChange={(e) => setLocalResidentState(e.target.value)}
                  >
                    <option value="">Select</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Prior Year AGI</label>
                  <input
                    type="number"
                    value={localPriorAGI}
                    onChange={(e) => setLocalPriorAGI(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>IRS PIN</label>
                  <input
                    type="text"
                    value={localIrsPin}
                    onChange={(e) => setLocalIrsPin(e.target.value)}
                    pattern="\d{5}"
                    required
                  />
                </div>
              </div>
            </div>

            {localMaritalStatus === 'marriedJointly' && (
              <div className="p-description">
                <h3 className="h3-subtitle">
                  <PiSymbol /> Spouse Information
                </h3>
                <div className="grid-2-col">
                  <div className="input-group">
                    <label>Spouse Name</label>
                    <input
                      type="text"
                      value={localSpouseName}
                      onChange={(e) => setLocalSpouseName(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Spouse Social Security Number</label>
                    <input
                      type="text"
                      value={localSpouseSSN}
                      onChange={(e) => setLocalSpouseSSN(e.target.value)}
                      pattern="\d{9}"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Spouse Date of Birth</label>
                    <input
                      type="date"
                      value={localSpouseDob}
                      onChange={(e) => setLocalSpouseDob(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="p-description">
              <h3 className="h3-subtitle">
                <PiSymbol /> Dependents
              </h3>
              <p>
                Select 'Add Dependent' to add a dependent. You can add as many as you have. If you have none, skip this section.
              </p>
              <ul className="option-list">
                {dependentOptions.map(({ label, value, isClear }) => (
                  <li
                    key={value}
                    className={`dependent-option option-item ${!isClear && localDependents.length > 0 ? 'selected' : ''}`}
                    onClick={() => toggleDependent(value)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') toggleDependent(value);
                    }}
                  >
                    {label} {!isClear && localDependents.length > 0 ? ` (${localDependents.length})` : ''}
                  </li>
                ))}
              </ul>
             {localDependents.map((dep, i) => (
    <div key={i}>
      <div
        className="dependent-grid"
      >
        {/* First Name */}
        <div className="input-group">
          <label
            className="dependent-label"
            htmlFor={`dependentFirstName-${i}`}
          >
            First Name
          </label>
          <input
            id={`dependentFirstName-${i}`}
            type="text"
            value={dep.firstName || ''}
            onChange={(e) => updateDependent(i, 'firstName', e.target.value)}
            className="dependent-input"
          />
        </div>

        {/* Last Name */}
        <div className="input-group">
          <label
            className="dependent-label"
            htmlFor={`dependentLastName-${i}`}
          >
            Last Name
          </label>
          <input
            id={`dependentLastName-${i}`}
            type="text"
            value={dep.lastName || ''}
            onChange={(e) => updateDependent(i, 'lastName', e.target.value)}
            className="dependent-input"
          />
        </div>

        {/* SSN */}
        <div className="input-group">
          <label
            className="dependent-label"
            htmlFor={`dependentSSN-${i}`}
          >
            SSN
          </label>
          <input
            id={`dependentSSN-${i}`}
            type="text"
            value={dep.ssn || ''}
            onChange={(e) => updateDependent(i, 'ssn', e.target.value)}
            className="dependent-input"
            pattern="\d{9}"
            required
          />
        </div>

        {/* Date of Birth */}
        <div className="input-group">
          <label
            className="dependent-label"
            htmlFor={`dependentDob-${i}`}
          >
            Date of Birth
          </label>
          <input
            id={`dependentDob-${i}`}
            type="date"
            value={dep.dob || ''}
            onChange={(e) => updateDependent(i, 'dob', e.target.value)}
            className="dependent-input"
          />
        </div>

        {/* Relationship */}
        <div className="input-group">
          <label
            className="dependent-label"
            htmlFor={`dependentRelationship-${i}`}
          >
            Relationship
          </label>
          <select
            id={`dependentRelationship-${i}`}
            value={dep.relationship || ''}
            onChange={(e) => updateDependent(i, 'relationship', e.target.value.toUpperCase())}
            className="dependent-input"
          >
            <option value="">Select</option>
            <option value="SON">Son</option>
            <option value="DAUGHTER">Daughter</option>
            <option value="CHILD">Child</option>
            <option value="PARENT">Parent</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => removeDependent(i)}
        className="remove-button"
      >
        Remove
      </button>
    </div>
  ))}
            </div>

            <div className="p-description">
              <h3 className="h3-subtitle">
                <PiSymbol /> Your Income Sources
              </h3>
              <p>
                Select all income types you received. Click a type multiple times if you have multiple sources (e.g., click W-2 twice if you have two W-2s). We’ll guide your refund path and match to IRS forms (e.g., W-2, 1099).
              </p>
              <ul className="option-list">
                {incomeOptions.map(({ label, value, pi, isClear }) => (
                  <li
                    key={value}
                    className={`income-option option-item ${!isClear && localIncomeSources.some(s => s.type === value) ? 'selected' : ''}`}
                    onClick={() => toggleIncome(value)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') toggleIncome(value);
                    }}
                  >
                    {pi && !isClear && <PiSymbol /> } {label} {!isClear && localIncomeSources.filter(s => s.type === value).length > 0 ? ` (${localIncomeSources.filter(s => s.type === value).length})` : ''}
                  </li>
                ))}
              </ul>
            </div>

            {localMaritalStatus === 'marriedJointly' && (
              <div className="p-description">
                <h3 className="h3-subtitle">
                  <PiSymbol /> Spouse Income Sources
                </h3>
                <p>
                  Select all income types your spouse received. Click a type multiple times if they have multiple sources (e.g., click W-2 twice if they have two W-2s). These will be included in your joint filing.
                </p>
                <ul className="option-list">
                  {incomeOptions.map(({ label, value, pi, isClear }) => (
                    <li
                      key={`spouse-${value}`}
                      className={`income-option option-item ${!isClear && localSpouseIncomeSources.some(s => s.type === value) ? 'selected' : ''}`}
                      onClick={() => toggleIncome(value, 'spouse')}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') toggleIncome(value, 'spouse');
                      }}
                    >
                      {pi && !isClear && <PiSymbol /> } {isClear ? label : `Spouse ${label}`} {!isClear && localSpouseIncomeSources.filter(s => s.type === value).length > 0 ? ` (${localSpouseIncomeSources.filter(s => s.type === value).length})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex-space-between">
              {onBack && (
                <button type="button" onClick={handleBack} className="back-button">
                  Back
                </button>
              )}
              <button
                className="primary next-button"
                onClick={handleSubmit}
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
    </>
  );
}

PersonalInfoStep.propTypes = {
  answers: PropTypes.object.isRequired,
  setAnswers: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};