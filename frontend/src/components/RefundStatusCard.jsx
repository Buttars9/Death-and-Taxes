import React from 'react';
import { useWizardStore } from "../stores/wizardStore";
import { exportIRSReceiptPDF } from "../utils/exportIRSPreview";

export default function RefundStatusCard() {
  const store = useWizardStore.getState();
  const refundUSD = store.getRefundableCredits().length * 1000;
  const refundDisplay = `$${refundUSD.toFixed(2)}`;

  const timestamp = new Date().toISOString();

  return (
    <div style={styles.card}>
      <h3>📄 Filing Status: <span style={styles.status}>Confirmed</span></h3>
      <p><strong>Refund Estimate:</strong> 💵 {refundDisplay}</p>
      <p><strong>Submitted:</strong> <span style={styles.timestamp}>{timestamp}</span></p>
      <button style={styles.button} onClick={exportIRSReceiptPDF}>
        Download Receipt (PDF)
      </button>
    </div>
  );
}

const styles = {
  card: {
    background: '#1c2232',
    padding: '2rem',
    borderRadius: '12px',
    color: '#e1e8fc',
    boxShadow: '0 0 12px #72caff',
    marginBottom: '2rem',
    maxWidth: '600px',
    width: '100%',
  },
  status: {
    color: '#72caff',
    fontWeight: 'bold',
  },
  timestamp: {
    fontFamily: 'monospace',
    color: '#9beaff',
  },
  button: {
    marginTop: '1rem',
    background: '#72caff',
    color: '#0f131f',
    padding: '0.75rem 1.25rem',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};