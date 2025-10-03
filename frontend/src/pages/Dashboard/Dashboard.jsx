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
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to Your Dashboard</h1>
      <p style={styles.subtitle}>
        Logged in as <strong>{user?.email || 'anonymous'}</strong>
      </p>
      <p style={styles.note}>IRS-grade filing tools coming online…</p>

      <div style={styles.uploadInfo}>
        <RefundEstimate manualFields={{}} parsedFields={parsedFields || {}} />
      </div>

      <div style={styles.uploadInfo}>
        <h3 style={styles.uploadTitle}>📄 Upload Documents</h3>
        <p style={styles.uploadHint}>
          Upload W-2, 1099, etc. to pre-fill your filing data and see an estimated refund. Click "Start Filing" to complete your tax forms.
        </p>
        <DocumentUpload onParsed={setParsedFields} />
      </div>

      {submissions.length > 0 && <RefundStatusCard />}

      <div style={styles.centerBlock}>
  <button
    style={{
      ...styles.authButton,
      opacity: canStart ? 1 : 0.5,
      cursor: canStart ? 'pointer' : 'not-allowed',
    }}
    onClick={handleStartFiling}
    title="Begin filing — even if some fields are blank"
  >
    Start Filing
  </button>

    <button
    style={styles.authButton}
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
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0b0014',
    color: '#e0e0ff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '2rem',
    fontFamily: 'Segoe UI, sans-serif',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#8c4dcc',
  },
  subtitle: {
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
    color: '#ffffff',
  },
  note: {
    fontSize: '1rem',
    fontStyle: 'italic',
    color: '#a166ff',
    marginBottom: '2rem',
  },
  uploadInfo: {
    width: '100%',
    maxWidth: '600px',
    background: '#1a0028',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 0 12px #8c4dcc',
    marginBottom: '2rem',
  },
  uploadTitle: {
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
    color: '#e0e0ff',
  },
  uploadHint: {
    fontSize: '0.95rem',
    color: '#c0b3ff',
    marginBottom: '0.5rem',
  },
  actionsBlock: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '3rem',
  },
  authButton: {
    height: '42px',
    backgroundColor: 'black',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    boxShadow: '0 0 12px #a166ff',
    animation: 'boxGlow 6s infinite',
    border: 'none',
    transition: 'transform 0.2s ease',
    padding: '0 14px',
  },
  secondaryButton: {
    height: '42px',
    backgroundColor: '#1a0028',
    borderRadius: '10px',
    color: '#e0e0ff',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    border: '1px solid #a166ff',
    boxShadow: '0 0 8px #a166ff',
    cursor: 'pointer',
    padding: '0 14px',
    transition: 'transform 0.2s ease',
  },
  centerBlock: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    margin: '3rem 0',
  },
};