import React from 'react';
import PropTypes from 'prop-types';

export default function AuditTrailLedger({ submissions }) {
  return (
    <div style={styles.ledger}>
      <h3>📜 Filing History</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>🔒 Timestamp</th>
            <th>Refund (USD)</th>
            <th>Refund (π)</th>
            <th>Escrow Hash ✅</th>
            <th>Status</th>
            <th>Receipt</th>
            <th>Filing Status</th>
            <th>Next Step</th>
            <th>🧾 Receipt Hash</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((entry, idx) => (
            <tr key={idx}>
              <td style={styles.mono}>
                <span style={styles.lock}>🔒</span> {entry.timestamp}
              </td>
              <td>${entry.refundUSD}</td>
              <td>≈ {entry.refundPi} π</td>
              <td>
                <code style={styles.hash}>{entry.escrowHash}</code>
                <span style={styles.verified}>✅ Verified</span>
              </td>
              <td>{entry.status}</td>
              <td>
                <a href={entry.receiptUrl} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </td>
              <td>
                <span style={{
                  ...styles.badge,
                  backgroundColor: badgeColors[entry.filingStatus] || '#444'
                }}>
                  {entry.filingStatus}
                </span>
              </td>
              <td>
                {renderNextStep(entry)}
              </td>
              <td>
                {entry.receiptHash ? (
                  <code style={styles.hash}>{entry.receiptHash}</code>
                ) : (
                  <span style={styles.next}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderNextStep(entry) {
  const status = entry.filingStatus;
  if (status === 'Filed') return <span style={styles.next}>Awaiting review</span>;
  if (status === 'Under Review') return <span style={styles.next}>Check back soon</span>;
  if (status === 'Refund Approved') return <span style={styles.next}>Download receipt</span>;
  if (status === 'Receipt Generated') {
    return (
      <a href={entry.receiptUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
        View Receipt
      </a>
    );
  }
  return <span style={styles.next}>—</span>;
}

AuditTrailLedger.propTypes = {
  submissions: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.string.isRequired,
      refundUSD: PropTypes.number.isRequired,
      refundPi: PropTypes.string.isRequired,
      escrowHash: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      receiptUrl: PropTypes.string.isRequired,
      filingStatus: PropTypes.string.isRequired,
      receiptHash: PropTypes.string, // optional
    })
  ).isRequired,
};

const badgeColors = {
  Filed: '#999',
  'Under Review': '#f90',
  'Refund Approved': '#0a0',
  'Receipt Generated': '#09f',
};

const styles = {
  ledger: {
    marginTop: '3rem',
    background: '#1c2232',
    padding: '2rem',
    borderRadius: '12px',
    color: '#e1e8fc',
    boxShadow: '0 0 12px #72caff',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  },
  mono: {
    fontFamily: 'monospace',
    color: '#9beaff',
  },
  hash: {
    fontFamily: 'monospace',
    background: '#0f131f',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    color: '#72caff',
    marginRight: '0.5rem',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: 'bold',
    color: '#fff',
    fontSize: '0.85rem',
  },
  next: {
    fontStyle: 'italic',
    color: '#ccc',
  },
  link: {
    color: '#72caff',
    textDecoration: 'underline',
    fontWeight: 'bold',
  },
  verified: {
    marginLeft: '0.25rem',
    color: '#0f0',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  lock: {
    marginRight: '0.25rem',
    color: '#72caff',
  },
};