import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import GlowingBox from '../../../components/GlowingBox.jsx';
import { useWizardStore } from '../../../stores/wizardStore';
import { fetchAutofillData } from '../../../services/api';
import RefundEstimate from '../../../components/RefundEstimate';

// FIX: Conditionally import PiSymbol to avoid potential crashes
const PiSymbol = process.env.NODE_ENV === 'development' ? () => null : require('../../../components/PiSymbol.jsx').default;

const incomeOptions = [
  { label: 'W-2 Employment', value: 'w2' },
  { label: "Spouse's W-2 Employment", value: 'w2-spouse' },
  { label: 'Self-Employment (1099)', value: '1099' },
  { label: "Spouse's Self-Employment (1099)", value: '1099-spouse' },
  { label: 'Unemployment Benefits', value: 'unemployment' },
  { label: "Spouse's Unemployment Benefits", value: 'unemployment-spouse' },
  { label: 'Interest & Dividends', value: 'interest_dividends' },
  { label: "Spouse's Interest & Dividends", value: 'interest_dividends-spouse' },
  { label: 'Rental Income', value: 'rental' },
  { label: "Spouse's Rental Income", value: 'rental-spouse' },
  { label: 'Retirement Income (401k, IRA)', value: 'retirement' },
  { label: "Spouse's Retirement Income (401k, IRA)", value: 'retirement-spouse' },
  { label: 'Social Security Benefits', value: 'social_security' },
  { label: "Spouse's Social Security Benefits", value: 'social_security-spouse' },
  { label: 'Crypto & Precious Metals', value: 'crypto_metals', pi: true },
  { label: "Spouse's Crypto & Precious Metals", value: 'crypto_metals-spouse', pi: true },
  { label: 'Alimony Received', value: 'alimony' },
  { label: "Spouse's Alimony Received", value: 'alimony-spouse' },
  { label: 'Gambling Winnings', value: 'gambling' },
  { label: "Spouse's Gambling Winnings", value: 'gambling-spouse' },
  { label: 'Farm Income', value: 'farm' },
  { label: "Spouse's Farm Income", value: 'farm-spouse' },
  { label: 'Foreign Income', value: 'foreign' },
  { label: "Spouse's Foreign Income", value: 'foreign-spouse' },
  { label: 'Other', value: 'other' },
  { label: "Spouse's Other", value: 'other-spouse' },
];

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida',
  'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska',
  'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee',
  'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const IncomeStep = ({ initialData, onNext, onBack, answers }) => {
  const { setAnswers, updateField, w2s, answers: storeAnswers } = useWizardStore();
  const navigate = useNavigate();
  const [localIncomeSources, setLocalIncomeSources] = useState([]);
  const [filingStatus, setFilingStatus] = useState(initialData?.filingStatus || answers?.maritalStatus || '');
  const [autofillEnabled, setAutofillEnabled] = useState(false);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [error, setError] = useState('');
  const [additionalIncomeModalOpen, setAdditionalIncomeModalOpen] = useState(false);
  const [newIncomeType, setNewIncomeType] = useState('');

  useEffect(() => {
    if (answers?.incomeSources && Array.isArray(answers.incomeSources)) {
      const prePopulated = answers.incomeSources.map(item => {
        const isObject = typeof item === 'object' && item !== null && 'type' in item;
        const itemType = isObject ? item.type : item;
        const itemOwner = isObject ? item.owner || 'self' : (item.includes('-spouse') ? 'spouse' : 'self');
        const cleanType = itemType.replace('-spouse', '');
        const matchingW2 = Array.isArray(w2s) ? w2s.find(w2 => w2.type === 'w2' && w2.owner === itemOwner) : null;
        if (cleanType === 'w2' && matchingW2) {
          return {
            type: 'w2',
            owner: itemOwner,
            amount: matchingW2.box1 || '',
            employer: matchingW2.employerName || '',
            box1: matchingW2.box1 || '',
            box2: matchingW2.box2 || '',
            box3: matchingW2.box3 || '',
            box4: matchingW2.box4 || '',
            box5: matchingW2.box5 || '',
            box6: matchingW2.box6 || '',
            box7: matchingW2.box7 || '',
            box8: matchingW2.box8 || '',
            box9: matchingW2.box9 || '',
            box10: matchingW2.box10 || '',
            box11: matchingW2.box11 || '',
            box12a: matchingW2.box12a || '',
            box12b: matchingW2.box12b || '',
            box12c: matchingW2.box12c || '',
            box12d: matchingW2.box12d || '',
            box13Statutory: matchingW2.box13Statutory || false,
            box13Retirement: matchingW2.box13Retirement || false,
            box13SickPay: matchingW2.box13SickPay || false,
            box14: matchingW2.box14 || '',
            employerName: matchingW2.employerName || '',
            employerEIN: matchingW2.employerEIN || '',
            employerAddress: matchingW2.employerAddress || '',
            employeeAddress: matchingW2.employeeAddress || '',
            box15: matchingW2.box15 || '',
            box16: matchingW2.box16 || '',
            box17: matchingW2.box17 || '',
            box18: matchingW2.box18 || '',
            box19: matchingW2.box19 || '',
            box20: matchingW2.box20 || '',
          };
        }
        return isObject ? { ...item, amount: item.amount || '', employer: item.employer || '' } : {
          type: cleanType,
          owner: itemOwner,
          amount: '',
          employer: '',
          belongsTo: '',
          foreign: false,
          country: '',
          residency: '',
          exclusion: false,
          exclusionAmount: '',
          treaty: '',
          box1: '',
          box2: '',
          box3: '',
          box4: '',
          box5: '',
          box6: '',
          box7: '',
          box8: '',
          box9: '',
          box10: '',
          box11: '',
          box12a: '',
          box12b: '',
          box12c: '',
          box12d: '',
          box13Statutory: false,
          box13Retirement: false,
          box13SickPay: false,
          box14: '',
          employerName: '',
          employerEIN: '',
          employerAddress: '',
          employeeAddress: '',
          box15: '',
          box16: '',
          box17: '',
          box18: '',
          box19: '',
          box20: '',
        };
      }).filter(item => item.type);

      // Only update if prePopulated differs from current localIncomeSources
      if (JSON.stringify(prePopulated) !== JSON.stringify(localIncomeSources)) {
        console.log('Updating localIncomeSources:', prePopulated);
        setLocalIncomeSources(prePopulated);
      }
    }
  }, [answers, w2s]);

  const updateIncomeSource = (index, updatedSource) => {
    const updated = [...localIncomeSources];
    updated[index] = updatedSource;
    setLocalIncomeSources(updated);
    setAnswers({ ...storeAnswers, incomeSources: updated });
  };

  const addIncomeSource = (value) => {
    const [type, ownerSuffix] = value.split('-');
    const owner = ownerSuffix === 'spouse' ? 'spouse' : 'self';
    const newSource = {
      type,
      owner,
      amount: '',
      employer: '',
      belongsTo: '',
      foreign: false,
      country: '',
      residency: '',
      exclusion: false,
      exclusionAmount: '',
      treaty: '',
      box1: '',
      box2: '',
      box3: '',
      box4: '',
      box5: '',
      box6: '',
      box7: '',
      box8: '',
      box9: '',
      box10: '',
      box11: '',
      box12a: '',
      box12b: '',
      box12c: '',
      box12d: '',
      box13Statutory: false,
      box13Retirement: false,
      box13SickPay: false,
      box14: '',
      employerName: '',
      employerEIN: '',
      employerAddress: '',
      employeeAddress: '',
      box15: '',
      box16: '',
      box17: '',
      box18: '',
      box19: '',
      box20: '',
    };
    const updated = [...localIncomeSources, newSource];
    setLocalIncomeSources(updated);
    setAnswers({ ...storeAnswers, incomeSources: updated });
  };

  const removeIncomeSource = (index) => {
    const updated = localIncomeSources.filter((_, i) => i !== index);
    setLocalIncomeSources(updated);
    setAnswers({ ...storeAnswers, incomeSources: updated });
  };

  const handleAdditionalIncome = () => {
    if (newIncomeType) {
      addIncomeSource(newIncomeType);
      setAdditionalIncomeModalOpen(false);
      setNewIncomeType('');
    } else {
      setError('Please select an income type.');
    }
  };

  useEffect(() => {
    if (autofillEnabled) {
      setAutofillLoading(true);
      fetchAutofillData('default-user')
        .then((data) => {
          if (data?.incomeSources?.length) {
            setLocalIncomeSources(data.incomeSources);
            setAnswers({ ...storeAnswers, incomeSources: data.incomeSources });
          }
          setAutofillLoading(false);
        })
        .catch((err) => {
          setError('Autofill failed. Please enter income manually.');
          console.error('Autofill error:', err);
          setAutofillLoading(false);
        });
    }
  }, [autofillEnabled, setAnswers, storeAnswers]);

  const handleSubmit = () => {
    console.log('handleSubmit triggered, onNext:', typeof onNext, 'onNext exists:', !!onNext);
    try {
      const payload = {
        filingStatus,
        incomeSources: localIncomeSources,
        primaryResidence: initialData?.primaryResidence || '',
        livedAbroad: initialData?.livedAbroad || false,
        abroadCountry: initialData?.abroadCountry || '',
        abroadDuration: initialData?.abroadDuration || '',
        agi: initialData?.agi || '',
        irsPin: initialData?.irsPin || '',
        tipIncome: initialData?.tipIncome || '',
        overtimeIncome: initialData?.overtimeIncome || '',
        autoLoanInterest: initialData?.autoLoanInterest || '',
        isSenior: initialData?.isSenior || false,
      };
      console.log('Saving to wizardStore:', payload);
      setAnswers({ ...storeAnswers, ...payload });
      if (onNext && typeof onNext === 'function') {
        console.log('Calling onNext');
        onNext();
      } else {
        console.warn('onNext is not a function or null');
        setError('Next action is not available. Check wizard configuration.');
        navigate('/filing/deductions');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', { message: error.message, stack: error.stack });
      setError('An error occurred. Proceeding to next step.');
      navigate('/filing/deductions');
    }
  };

  const handleBack = () => {
    console.log('handleBack triggered, onBack:', typeof onBack, 'onBack exists:', !!onBack);
    if (onBack && typeof onBack === 'function') {
      console.log('Calling onBack');
      onBack();
    } else {
      console.warn('onBack is not a function or null');
      navigate('/filing/personal');
    }
  };

  const renderIncomeFields = (source, index) => {
    if (!source || !source.type) return null;
    const incomeType = source.type.toLowerCase();
    const isSpouse = source.owner === 'spouse';
    const labelPrefix = isSpouse ? 'Spouse’s ' : '';
    switch (incomeType) {
      case 'w2':
        return (
          <div className="w2-block" style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            margin: '2rem 0',
            background: '#1a1f2f',
            borderRadius: '8px',
            boxShadow: '0 0 12px rgba(161, 102, 255, 0.3)',
            maxWidth: '720px'
          }}>
            <h4 style={{ color: '#a166ff' }}>{labelPrefix}W-2 Income</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div className="input-group">
                <label>Employer Name</label>
                <input
                  type="text"
                  value={source.employerName || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, employerName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Employer EIN</label>
                <input
                  type="text"
                  value={source.employerEIN || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, employerEIN: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Employer Address</label>
                <input
                  type="text"
                  value={source.employerAddress || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, employerAddress: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Wages (Box 1)</label>
                <input
                  type="number"
                  value={source.box1 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box1: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Federal Income Tax Withheld (Box 2)</label>
                <input
                  type="number"
                  value={source.box2 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box2: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Social Security Wages (Box 3)</label>
                <input
                  type="number"
                  value={source.box3 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box3: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Social Security Tax Withheld (Box 4)</label>
                <input
                  type="number"
                  value={source.box4 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box4: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Medicare Wages and Tips (Box 5)</label>
                <input
                  type="number"
                  value={source.box5 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box5: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Medicare Tax Withheld (Box 6)</label>
                <input
                  type="number"
                  value={source.box6 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box6: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Social Security Tips (Box 7)</label>
                <input
                  type="number"
                  value={source.box7 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box7: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Allocated Tips (Box 8)</label>
                <input
                  type="number"
                  value={source.box8 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box8: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Verification Code (Box 9)</label>
                <input
                  type="text"
                  value={source.box9 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box9: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Dependent Care Benefits (Box 10)</label>
                <input
                  type="number"
                  value={source.box10 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box10: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Nonqualified Plans (Box 11)</label>
                <input
                  type="number"
                  value={source.box11 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box11: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Box 12a</label>
                <input
                  type="text"
                  value={source.box12a || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box12a: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Box 12b</label>
                <input
                  type="text"
                  value={source.box12b || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box12b: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Box 12c</label>
                <input
                  type="text"
                  value={source.box12c || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box12c: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Box 12d</label>
                <input
                  type="text"
                  value={source.box12d || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box12d: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Statutory Employee (Box 13)</label>
                <input
                  type="checkbox"
                  checked={source.box13Statutory || false}
                  onChange={(e) => updateIncomeSource(index, { ...source, box13Statutory: e.target.checked })}
                  style={{
                    marginRight: '0.5rem'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Retirement Plan (Box 13)</label>
                <input
                  type="checkbox"
                  checked={source.box13Retirement || false}
                  onChange={(e) => updateIncomeSource(index, { ...source, box13Retirement: e.target.checked })}
                  style={{
                    marginRight: '0.5rem'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Third-Party Sick Pay (Box 13)</label>
                <input
                  type="checkbox"
                  checked={source.box13SickPay || false}
                  onChange={(e) => updateIncomeSource(index, { ...source, box13SickPay: e.target.checked })}
                  style={{
                    marginRight: '0.5rem'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Other (Box 14)</label>
                <input
                  type="text"
                  value={source.box14 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box14: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>State (Box 15)</label>
                <select
                  value={source.box15 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box15: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>State Wages (Box 16)</label>
                <input
                  type="number"
                  value={source.box16 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box16: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>State Income Tax Withheld (Box 17)</label>
                <input
                  type="number"
                  value={source.box17 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box17: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Local Wages (Box 18)</label>
                <input
                  type="number"
                  value={source.box18 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box18: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Local Income Tax Withheld (Box 19)</label>
                <input
                  type="number"
                  value={source.box19 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box19: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Locality Name (Box 20)</label>
                <input
                  type="text"
                  value={source.box20 || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, box20: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={() => removeIncomeSource(index)}
              style={{
                background: '#1c2232',
                color: '#e1e8fc',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #3a3f55',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}
            >
              Remove
            </button>
          </div>
        );
      case 'foreign':
        return (
          <div className="foreign-block" style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            margin: '2rem 0',
            background: '#1a1f2f',
            borderRadius: '8px',
            boxShadow: '0 0 12px rgba(161, 102, 255, 0.3)',
            maxWidth: '720px'
          }}>
            <h4 style={{ color: '#a166ff' }}>{labelPrefix}Foreign Income</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div className="input-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={source.amount || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, amount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Country</label>
                <input
                  type="text"
                  value={source.country || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, country: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Residency Status</label>
                <input
                  type="text"
                  value={source.residency || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, residency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Foreign Earned Income Exclusion</label>
                <input
                  type="checkbox"
                  checked={source.exclusion || false}
                  onChange={(e) => updateIncomeSource(index, { ...source, exclusion: e.target.checked })}
                  style={{
                    marginRight: '0.5rem'
                  }}
                />
              </div>
              {source.exclusion && (
                <>
                  <div className="input-group">
                    <label>Exclusion Amount</label>
                    <input
                      type="number"
                      value={source.exclusionAmount || ''}
                      onChange={(e) => updateIncomeSource(index, { ...source, exclusionAmount: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #3a3f55',
                        background: '#1c2232',
                        color: '#e1e8fc'
                      }}
                    />
                  </div>
                  <div className="input-group">
                    <label>Tax Treaty Reference</label>
                    <input
                      type="text"
                      value={source.treaty || ''}
                      onChange={(e) => updateIncomeSource(index, { ...source, treaty: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #3a3f55',
                        background: '#1c2232',
                        color: '#e1e8fc'
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={() => removeIncomeSource(index)}
              style={{
                background: '#1c2232',
                color: '#e1e8fc',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #3a3f55',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}
            >
              Remove
            </button>
          </div>
        );
      default:
        return (
          <div className="income-block" style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            margin: '2rem 0',
            background: '#1a1f2f',
            borderRadius: '8px',
            boxShadow: '0 0 12px rgba(161, 102, 255, 0.3)',
            maxWidth: '720px'
          }}>
            <h4 style={{ color: '#a166ff' }}>{labelPrefix}{source.type || 'Other'} Income</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div className="input-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={source.amount || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, amount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
              <div className="input-group">
                <label>Employer / Source</label>
                <input
                  type="text"
                  value={source.employer || ''}
                  onChange={(e) => updateIncomeSource(index, { ...source, employer: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #3a3f55',
                    background: '#1c2232',
                    color: '#e1e8fc'
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={() => removeIncomeSource(index)}
              style={{
                background: '#1c2232',
                color: '#e1e8fc',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #3a3f55',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}
            >
              Remove
            </button>
          </div>
        );
    }
  };

  return (
    <GlowingBox>
      <div className="income-step" style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>
            <PiSymbol /> Income Information
          </h2>
          <p>
            Enter all sources of income for the tax year. You may autofill from linked accounts or enter manually.
          </p>

          <div className="section">
            <div className="autofill-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={autofillEnabled}
                  onChange={() => setAutofillEnabled(!autofillEnabled)}
                />
                Autofill from linked accounts
              </label>
              {autofillLoading && <span className="loading-text">Loading data...</span>}
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>

          <div className="section">
            <h3>
              <PiSymbol /> Income Sources
            </h3>
            <p>Your selected income types from Personal Info are pre-loaded below.</p>
            {localIncomeSources.map((source, index) => (
              <div
                key={index}
                className="income-block"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1rem',
                  margin: '2rem 0',
                  background: '#1a1f2f',
                  borderRadius: '8px',
                  boxShadow: '0 0 12px rgba(161, 102, 255, 0.3)',
                  maxWidth: '720px',
                  width: '100%'
                }}
              >
                {renderIncomeFields(source, index)}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAdditionalIncomeModalOpen(true)}
              style={{
                background: '#a166ff',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}
            >
              + Add Additional Income
            </button>
          </div>

          {additionalIncomeModalOpen && (
            <div className="modal" style={{
              position: 'fixed',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <div style={{
                background: '#1a1f2f',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 0 12px rgba(161, 102, 255, 0.3)',
                color: '#e1e8fc',
                maxWidth: '500px',
                width: '90%',
              }}>
                <h3>
                  <PiSymbol /> Add Additional Income
                </h3>
                <div className="input-group">
                  <label>Income Type</label>
                  <select
                    value={newIncomeType}
                    onChange={(e) => setNewIncomeType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #3a3f55',
                      background: '#1c2232',
                      color: '#e1e8fc'
                    }}
                  >
                    <option value="">Select</option>
                    {incomeOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button
                    onClick={() => setAdditionalIncomeModalOpen(false)}
                    style={{
                      background: '#1c2232',
                      color: '#e1e8fc',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid #3a3f55',
                      fontWeight: 'bold'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdditionalIncome}
                    style={{
                      background: '#72caff',
                      color: '#0f131f',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="step-buttons">
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
                display: 'block',
                visibility: 'visible',
                opacity: 1
              }}
            >
              Back
            </button>
            <button
              className="primary"
              onClick={handleSubmit}
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
        </div>
        <div style={{ flex: 1, padding: '1rem' }}>
          <RefundEstimate manualFields={storeAnswers || { maritalStatus: 'single', incomeSources: [] }} />
        </div>
      </div>

      <style jsx>{`
        .income-step {
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
        h3 {
          color: #a166ff;
          margin-bottom: 1rem;
        }
        .input-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e1e8fc;
        }
        input, select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #3a3f55;
          background: #1c2232;
          color: #e1e8fc;
        }
        input:focus, select:focus {
          outline: none;
          border-color: #72caff;
          box-shadow: 0 0 4px #72caff;
        }
        .income-options {
          list-style: none;
          padding: 0;
          margin: 2rem 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .income-block {
          margin: 2rem 0;
          padding: 1rem;
          background: #1a1f2f;
          border-radius: 8px;
          box-shadow: 0 0 12px rgba(161, 102, 255, 0.3);
        }
        .autofill-toggle {
          margin-bottom: 1rem;
        }
        .loading-text {
          margin-left: 0.5rem;
          font-style: italic;
          color: #c0b3ff;
        }
        .error-text {
          color: #ff6666;
          margin-top: 0.5rem;
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
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #3a3f55;
        }
        .modal {
          z-index: 1000;
        }
        .w2-block {
          margin: 2rem 0;
          padding: 1rem;
          background: #1a1f2f;
          borderRadius: '8px';
          box-shadow: 0 0 12px rgba(161, 102, 255, 0.3);
        }
      `}</style>
    </GlowingBox>
  );
};

IncomeStep.propTypes = {
  initialData: PropTypes.object,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  answers: PropTypes.object.isRequired,
};

export default IncomeStep;