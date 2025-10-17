import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import GlowingBox from '../../../components/GlowingBox.jsx';
import PiSymbol from '../../../components/PiSymbol.jsx';
import { useWizardStore } from '../../../stores/wizardStore';
import HelpIcon from '../../../components/HelpIcon';
import HelpModal from '../../../components/HelpModal';
import '../../../components/HelpIcon.css';
import { useStepNavigator } from '../../../hooks/useStepNavigator'; // ✅ Added
import steps from '../../wizard/wizardStep'; // ✅ Added

// @ts-ignore
export default function AuditReviewStep({ onNext, onBack }) {
  const { answers } = useWizardStore();
  const navigate = useNavigate();
  const { setCurrentStep } = useStepNavigator(steps.length); // ✅ Added
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 4000); // Longer scan
    return () => clearTimeout(timer);
  }, []);

  // Audit logic: Check for missing/ invalid fields
  const issues = [];
  if (!answers.firstName || !answers.lastName) issues.push({ message: 'Missing: Full name', step: 'personal' });
  if (!answers.ssn || !/^\d{9}$/.test(answers.ssn)) issues.push({ message: 'Invalid or missing SSN', step: 'personal' });
  if (!answers.dob) issues.push({ message: 'Missing date of birth', step: 'personal' });
  if (!answers.address || !answers.city || !answers.zip) issues.push({ message: 'Incomplete address (street, city, ZIP)', step: 'personal' });
  if (!answers.maritalStatus) issues.push({ message: 'Missing filing status', step: 'personal' });
  if (answers.maritalStatus === 'marriedJointly' && (!answers.spouseName || !answers.spouseSSN || !answers.spouseDob)) issues.push({ message: 'Incomplete spouse info', step: 'personal' });
  if (answers.dependents?.some(dep => !dep.firstName || !dep.lastName || !dep.ssn || !/^\d{9}$/.test(dep.ssn) || !dep.dob || !dep.relationship)) issues.push({ message: 'Incomplete dependent info (name, SSN, DOB, relationship)', step: 'personal' });
  if (!answers.residentState) issues.push({ message: 'Missing resident state', step: 'personal' });
  if (!answers.priorAGI) issues.push({ message: 'Missing prior year AGI', step: 'prior-year' });
if (!answers.irsPIN) {
  issues.push({ message: 'IRS PIN not provided (optional, but recommended for identity protection)', step: 'prior-year', optional: true });
} else if (!/^\d{6}$/.test(answers.irsPIN)) {
  issues.push({ message: 'IRS PIN must be 6 digits if provided', step: 'prior-year' });
}
  if (answers.incomeSources?.length === 0 || answers.incomeSources.some(src => !src.box1 && !src.amount)) issues.push({ message: 'Incomplete income sources (missing amount/wages)', step: 'income' });
  // Add more checks as needed (e.g., deductions, credits, bank info)

  const isPassed = issues.length === 0;

  const handleFix = (stepKey) => {
    const stepIndex = steps.findIndex((s) => s.key === stepKey); // ✅ Added
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex + 1); // ✅ Sync wizard step
      navigate(`/filing/${stepKey}`, { state: { fromAudit: true } }); // ✅ Navigate
    } else {
      console.warn('❌ Unknown stepKey:', stepKey); // ✅ Fallback
    }
  };

  const handleProceed = () => {
    if (isPassed) onNext();
  };

  return (
    <>
      <style>{`
        .audit-step {
          padding: 2rem;
        }
        .h2-title {
          color: #a166ff;
          margin-bottom: 1rem;
        }
        .p-description {
          margin-bottom: 2rem;
        }
        .issue-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }
        .issue-item {
          background: #1c2232;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .fix-button {
          background: #72caff;
          color: #0f131f;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          font-weight: bold;
        }
        .proceed-button {
          background: #00c78b;
          color: #0f131f;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          border: none;
          font-weight: bold;
          margin-top: 2rem;
        }
        .all-good {
          color: #00ff9d;
          font-weight: bold;
        }
        .scanner {
          text-align: center;
          color: #a166ff;
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        .spinner {
          border: 4px solid #1c2232;
          border-top: 4px solid #72caff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .audit-step {
            padding: 1rem;
          }
          .issue-item {
            flex-direction: column;
            gap: 1rem;
          }
          .fix-button {
            width: 100%;
          }
          .proceed-button {
            width: 100%;
          }
        }
      `}</style>
      <GlowingBox>
        <div className="audit-step">
          <h2 className="h2-title">
            <PiSymbol /> Review & Fix <HelpIcon onClick={() => { setSelectedTopic('auditReviewStep'); setShowHelpModal(true); }} />
          </h2>
          <p>
            Checking for missing or invalid information. Fix any issues below to ensure your filing is complete.
          </p>

          {isScanning ? (
            <div className="scanner">
              <div className="spinner"></div>
              Scanning your filing...
            </div>
          ) : issues.length === 0 ? (
            <p className="all-good">All good! Your filing is ready.</p>
          ) : (
            <ul className="issue-list">
              {issues.map((issue, i) => (
                <li key={i} className="issue-item">
                 <span>
  {issue.message}
  {issue.optional && <em style={{ color: '#888', marginLeft: '0.5rem' }}>(optional)</em>}
</span>
                  <button className="fix-button" onClick={() => handleFix(issue.step)}>
                    Fix
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button className="proceed-button" onClick={handleProceed} disabled={!isPassed || isScanning}>
            Proceed to Submit
          </button>

          {showHelpModal && (
            <HelpModal topic={selectedTopic} onClose={() => setShowHelpModal(false)} />
          )}
        </div>
      </GlowingBox>
    </>
  );
}

AuditReviewStep.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};