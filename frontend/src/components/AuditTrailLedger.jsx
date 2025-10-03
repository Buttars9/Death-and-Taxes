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
            <th>Refund Estimate (USD)</th>
            <th>Filing Status</th>
            <th>Submission ID</th>
            <th>Audit Event</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((entry, idx) => (
            <tr key={idx}>
              <td style={styles.mono}>
                <span style={styles.lock}>🔒</span> {entry.timestamp}
              </td>
              <td>${entry.refundUSD?.toLocaleString() || '—'}</td>
              <td>
                <span style={{
                  ...styles.badge,
                  backgroundColor: badgeColors[entry.filingStatus] || '#444'
                }}>
                  {entry.filingStatus || '—'}
                </span>
              </td>
              <td>{entry.submissionId || '—'}</td>
              <td>{entry.event || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

AuditTrailLedger.propTypes = {
  submissions: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.string.isRequired,
      refundUSD: PropTypes.number,
      filingStatus: PropTypes.string,
      submissionId: PropTypes.string,
      event: PropTypes.string,
    })
  ).isRequired,
};

const badgeColors = {
  Started: '#999',
  Signed: '#f90',
  Submitted: '#0a0',
  Completed: '#09f',
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
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: 'bold',
    color: '#fff',
    fontSize: '0.85rem',
  },
  lock: {
    marginRight: '0.25rem',
    color: '#72caff',
  },
};