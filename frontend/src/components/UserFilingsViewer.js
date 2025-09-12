// death-and-taxes/src/components/UserFilingsViewer.js

import React from 'react';
import useUserFilings from '../hooks/useUserFilings.js';

export default function UserFilingsViewer({ userEmail }) {
  const { filings, loading } = useUserFilings(userEmail);

  if (!userEmail) return <p>🔒 No user email provided.</p>;
  if (loading) return <p>⏳ Loading your filings...</p>;
  if (filings.length === 0) return <p>📭 No filings submitted yet.</p>;

  return (
    <div>
      <h2>Your Filings</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filings.map((filing) => (
          <li
            key={filing.filingId}
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
            }}
          >
            <p><strong>📌 Filing ID:</strong> {filing.filingId}</p>
            <p><strong>📅 Submitted:</strong> {new Date(filing.submittedAt).toLocaleString()}</p>
            <p><strong>💸 Refund Estimate:</strong> ${filing.refund.amount.toLocaleString()}</p>
            <p>
              <strong>🧾 Receipt:</strong>{' '}
              <a href={filing.vaultUrl} target="_blank" rel="noopener noreferrer">
                View PDF
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}