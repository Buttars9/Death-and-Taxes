import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/authStore';
import RefundEstimate from '../../components/RefundEstimate.jsx';
import DocumentUpload from '../../components/dashboard/DocumentUpload.jsx';
import RefundStatusCard from '../../components/RefundStatusCard';
import AuditTrailLedger from '../../components/AuditTrailLedger';
import { useWizardStore } from '../../stores/wizardStore';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { auditTrail, updateField, answers, setAnswers } = useWizardStore();
  const submissions = Array.isArray(auditTrail) ? auditTrail : [];
  const [parsedFields, setParsedFields] = useState(null);

  useEffect(() => {
    const loadWizardState = async () => {
      try {
        const res = await fetch('/api/loadWizardState', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (res.status === 404) {
          console.warn('Wizard state route not found — skipping.');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setAnswers(data.answers || {});
        }
      } catch (err) {
        console.error('Load wizard state error:', err);
      }
    };

    if (isAuthenticated && user) {
      loadWizardState();
    }
  }, [isAuthenticated, user, setAnswers]);

  useEffect(() => {
    const unsubscribe = useWizardStore.subscribe(
      (state) => state.answers,
      (answers) => {
        fetch('/api/saveWizardState', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ answers }),
        }).catch((err) => console.error('Save wizard state error:', err));
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (parsedFields) {
      // Sync parsedFields from document uploads with wizardStore
      updateField('firstName', parsedFields.firstName || '');
      updateField('lastName', parsedFields.lastName || '');
      updateField('ssn', parsedFields.ssn || '');
      updateField('dob', parsedFields.dob || '');
      updateField('address', parsedFields.address || '');
      updateField('maritalStatus', parsedFields.maritalStatus || '');
      updateField('residentState', parsedFields.residentState || '');
      updateField('priorAGI', parsedFields.priorAGI || null);
      updateField('irsPin', parsedFields.irsPin || null);
      updateField('w2s', parsedFields.w2s || []);
      updateField('incomeSources', parsedFields.incomeSources || []);
      updateField('dependents', parsedFields.dependents || []);
      updateField('foreignIncome', parsedFields.foreignIncome || false);
      updateField('foreignIncomeCountry', parsedFields.foreignIncomeCountry || null);
      updateField('foreignIncomeAmount', parsedFields.foreignIncomeAmount || null);
      updateField('foreignIncomeExclusion', parsedFields.foreignIncomeExclusion || null);
    }
  }, [parsedFields, updateField]);

  function handleStartFiling() {
    navigate('/filing');
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  const canStart = true;

  return (
    <>
      <style>{`
        .container {
          min-height: 100vh;
          background: #0b0014;
          color: #e0e0ff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 2rem;
          font-family: 'Segoe UI, sans-serif';
        }
        .title {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #8c4dcc;
        }
        .subtitle {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }
        .note {
          font-size: 1rem;
          font-style: italic;
          color: #a166ff;
          margin-bottom: 2rem;
        }
        .uploadInfo {
          width: 100%;
          max-width: 600px;
          background: #1a0028;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 0 12px #8c4dcc;
          margin-bottom: 2rem;
        }
        .uploadTitle {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: #e0e0ff;
        }
        .uploadHint {
          font-size: 0.95rem;
          color: #c0b3ff;
          margin-bottom: 0.5rem;
        }
        .centerBlock {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin: 3rem 0;
        }
        .authButton {
          height: 42px;
          background-color: black;
          border-radius: 10px;
          color: white;
          font-size: 0.9rem;
          font-weight: bold;
          box-shadow: 0 0 12px #a166ff;
          animation: boxGlow 6s infinite;
          border: none;
          transition: transform 0.2s ease;
          padding: 0 14px;
        }
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          .title {
            font-size: 1.5rem;
          }
          .subtitle {
            font-size: 1rem;
          }
          .note {
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
          }
          .uploadInfo {
            padding: 0.75rem;
            margin-bottom: 1.5rem;
          }
          .uploadTitle {
            font-size: 1rem;
          }
          .uploadHint {
            font-size: 0.85rem;
          }
          .centerBlock {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            margin: 2rem 0;
          }
          .authButton {
            width: 100%;
            max-width: 300px;
            padding: 0 10px;
          }
        }
      `}</style>
      <div className="container">
        <h1 className="title">Welcome to Your Dashboard</h1>
        <p className="subtitle">
          Logged in as <strong>{user?.email || 'anonymous'}</strong>
        </p>
        <p className="note">IRS-grade filing tools coming online…</p>

        <div className="uploadInfo">
          <RefundEstimate manualFields={{}} parsedFields={parsedFields || {}} />
        </div>

        <div className="uploadInfo">
          <h3 className="uploadTitle">📄 Upload Documents</h3>
          <p className="uploadHint">
            Upload W-2, 1099, etc. to pre-fill your filing data and see an estimated refund. Click "Start Filing" to complete your tax forms.
          </p>
          <DocumentUpload onParsed={setParsedFields} />
        </div>

        {submissions.length > 0 && <RefundStatusCard />}

        <div className="centerBlock">
          <button
            className="authButton"
            style={{
              opacity: canStart ? 1 : 0.5,
              cursor: canStart ? 'pointer' : 'not-allowed',
            }}
            onClick={handleStartFiling}
            title="Begin filing — even if some fields are blank"
          >
            Start Filing
          </button>

          <button
            className="authButton"
            onClick={handleLogout}
            title="Log out and return to home"
          >
            Logout
          </button>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <AuditTrailLedger submissions={submissions} />
        </div>
      </div>
    </>
  );
}