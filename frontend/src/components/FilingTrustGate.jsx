import React from 'react';
import PropTypes from 'prop-types';

export default function FilingTrustGate({ statusData, children }) {
  const trustConfirmed = statusData?.trustConfirmed;

  if (!trustConfirmed) {
    return (
      <div style={styles.gate} role="alert">
        <p style={styles.locked}>
          🔒 Trust not yet confirmed. Secure processing pending…
        </p>
      </div>
    );
  }

  return <div style={styles.gate}>{children}</div>;
}

FilingTrustGate.propTypes = {
  statusData: PropTypes.object.isRequired,
  children: PropTypes.node,
};

const styles = {
  gate: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#120020',
    borderRadius: '8px',
    boxShadow: '0 0 8px #8c4dcc',
  },
  locked: {
    color: '#ff99cc',
    fontStyle: 'italic',
  },
};