import React, { useState } from 'react';
import { getWillData } from '../stores/wizardStore';

export default function FinalWillPage() {
  const willData = getWillData();
  const isMinor = Number(willData.primaryBeneficiaryAge) < 18;
  const [confirmedAt, setConfirmedAt] = useState(null);

  const handleConfirm = async () => {
    const timestamp = Date.now();
    setConfirmedAt(timestamp);

    try {
      await fetch('/api/logEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'final_will_confirmed',
          timestamp,
          userId: willData?.userId,
          assetTypes: willData.assetSummary,
          executor: willData.executor,
        }),
      });
    } catch (err) {
      console.error('🧾 Will confirmation logging failed:', err);
    }
  };

  return (
    <div className="final-will-page" style={styles.page}>
      <h1 style={styles.header}>🪦 Final Will & Testament Summary</h1>

      <div style={styles.card}>
        <p><strong>Full Legal Name:</strong> {willData.fullName || '—'}</p>
        <p><strong>Primary Beneficiary:</strong> {willData.primaryBeneficiary || '—'}</p>
        <p><strong>Beneficiary Age:</strong> {willData.primaryBeneficiaryAge || '—'}</p>

        {isMinor && (
          <p><strong>Guardian for Minor:</strong> {willData.guardianName || '—'}</p>
        )}

        <p><strong>Executor of Will:</strong> {willData.executor || '—'}</p>
        <p><strong>Asset Summary:</strong> {willData.assetSummary || '—'}</p>

        {willData.assetSummary?.match(/crypto|precious metals/i) && (
          <p style={styles.trust}>🔐 Blockchain anchoring enabled for flagged assets</p>
        )}

        <p><strong>Final Wishes:</strong> {willData.finalWishes || '—'}</p>

        <p><strong>Escrow Verification:</strong> <span style={styles.verified}>✅ Verified</span></p>
        <p><strong>Timestamp Lock:</strong> <span style={styles.lock}>🔒 {confirmedAt ? new Date(confirmedAt).toLocaleString() : '—'}</span></p>
      </div>

      {confirmedAt ? (
        <p style={styles.confirmed}>✅ Will confirmed at {new Date(confirmedAt).toLocaleString()}</p>
      ) : (
        <button style={styles.button} onClick={handleConfirm}>
          Confirm & Lock Will
        </button>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: '2rem',
    background: '#0f131f',
    color: '#e1e8fc',
    fontFamily: 'sans-serif',
  },
  header: {
    fontSize: '1.75rem',
    marginBottom: '1.5rem',
  },
  card: {
    background: '#1c2232',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 0 12px #72caff',
    marginBottom: '2rem',
  },
  trust: {
    marginTop: '1rem',
    fontStyle: 'italic',
    color: '#72caff',
  },
  verified: {
    color: '#0f0',
    fontWeight: 'bold',
  },
  lock: {
    color: '#9beaff',
    fontFamily: 'monospace',
  },
  confirmed: {
    fontSize: '1rem',
    color: '#0f0',
    fontWeight: 'bold',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#72caff',
    color: '#0f131f',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};