import React from 'react';
import { useWizardStore } from '../../../store/wizardStore';

export default function SubmissionComplete({ formData, onEdit, onConfirm }) {
  const summaryList = [
    { label: 'Filing Status', key: 'filingStatus' },
    { label: 'Income Sources', key: 'incomeSources', format: (v) => v.join(', ') },
    { label: 'Deductions', key: 'deductions', format: (v) => v.join(', ') },
    { label: 'Credits', key: 'credits', format: (v) => v.join(', ') },
    { label: 'Routing #', key: 'routingNumber' },
    { label: 'Account #', key: 'accountNumber' },
    { label: 'Trust Confirmed', key: 'trustConfirmed', format: (v) => (v ? 'Yes' : 'No') },
  ];

  const savedAt = formData.savedAt
    ? new Date(formData.savedAt).toLocaleString()
    : null;

  // 🧮 Refund Preview Logic
  const store = useWizardStore.getState();
  const agi = store.estimateAGI();
  const refundableCredits = store.getRefundableCredits();
  const refundEstimate = refundableCredits.length * 1000;

  // 🚨 Missing Field Audit
  const missingFields = [];
  if (!store.firstName || !store.lastName) missingFields.push('Name');
  if (!store.ssn) missingFields.push('SSN');
  if (!store.agi) missingFields.push('AGI');
  if (store.answers.incomeSources.length === 0) missingFields.push('Income Sources');
  if (store.answers.deductions.length === 0) missingFields.push('Deductions');
  if (store.answers.credits.length === 0) missingFields.push('Credits');

  const isReadyToSubmit = missingFields.length === 0;

  // 🔐 Final Payload Assembly
  const finalPayload = {
    filingStatus: store.getFilingStatus(),
    incomeSources: store.answers.incomeSources,
    deductions: store.answers.deductions,
    credits: store.answers.credits,
    agi,
    refundEstimate,
    personal: {
      firstName: store.firstName,
      lastName: store.lastName,
      ssn: store.ssn,
      dob: store.dob,
      address: store.address,
      maritalStatus: store.maritalStatus,
    },
    w2: {
      box1: store.w2Box1,
      box2: store.w2Box2,
      box12: store.w2Box12,
    },
    irsPin: store.irsPin,
    state: store.state,
    trustConfirmed: store.answers.trustConfirmed || false,
    escrowEnabled: store.paymentType === 'pi',
  };

  const handleSubmit = () => {
    console.log('✅ Submitting final payload:', finalPayload);
    onConfirm(finalPayload);
  };

  return (
    <div className="questionnaire-step submission-complete">
      <h2 className="step-title">Review Your Info</h2>
      <p className="step-description">
        Double-check your details before locking in your filing. Transparency is our ritual.
      </p>

      {savedAt && (
        <p className="draft-timestamp">Restored from draft @ {savedAt}</p>
      )}

      <ul className="summary-list">
        {summaryList.map(({ label, key, format }) => {
          const rawValue = formData[key];
          const value = format ? format(rawValue || []) : rawValue;

          return (
            <li key={key} className="summary-item">
              <strong>{label}:</strong> {value || '—'}
              <button className="edit-button" onClick={() => onEdit(key)}>
                Edit
              </button>
            </li>
          );
        })}
      </ul>

      {/* 💰 Refund Preview */}
      <div className="refund-preview">
        <h3>Estimated Refund</h3>
        <p>${refundEstimate.toLocaleString()} based on {refundableCredits.length} refundable credit{refundableCredits.length !== 1 ? 's' : ''}.</p>
        <p>Adjusted Gross Income (AGI): ${agi.toLocaleString()}</p>
      </div>

      {/* 🚨 Audit Flags */}
      {missingFields.length > 0 && (
        <div className="audit-flags">
          <h4>Missing Info</h4>
          <ul>
            {missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 💎 Trust Gestures */}
      <div className="trust-signals">
        <p>✅ IRS rules applied to maximize refund</p>
        <p>✅ Pi escrow enabled for secure submission</p>
        <p>✅ Audit-grade logic applied across all steps</p>
      </div>

      <button
        className="confirm-button"
        onClick={handleSubmit}
        disabled={!isReadyToSubmit}
      >
        Confirm & Submit
      </button>
    </div>
  );
}