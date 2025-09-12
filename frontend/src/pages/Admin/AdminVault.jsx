// src/pages/AdminVault.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminVault() {
  const [filings, setFilings] = useState([]);
  const [filter, setFilter] = useState('All');
  const [wallets, setWallets] = useState({ pi: '', eth: '' });
  const [feeLogs, setFeeLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchVault();
    fetchWallets();
    fetchFeeLogs();
    fetchAuditLogs();
  }, []);

  async function fetchVault() {
    try {
      const res = await axios.get('/api/vault');
      setFilings(res.data);
    } catch (err) {
      console.error('Vault fetch error:', err);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await axios.post(`/api/vault/status/${id}`, { status: newStatus });
      fetchVault();
    } catch (err) {
      console.error('Status update error:', err);
    }
  }

  async function fetchWallets() {
    try {
      const res = await axios.get('/api/admin/wallets');
      setWallets(res.data);
    } catch (err) {
      console.error('Wallet fetch error:', err);
    }
  }

  async function saveWallets() {
    try {
      await axios.post('/api/admin/wallets', wallets);
      alert('Wallets saved.');
    } catch (err) {
      console.error('Wallet save error:', err);
    }
  }

  async function fetchFeeLogs() {
    try {
      const res = await axios.get('/api/admin/feeLogs');
      setFeeLogs(res.data);
    } catch (err) {
      console.error('Fee log fetch error:', err);
    }
  }

  async function fetchAuditLogs() {
    try {
      const res = await axios.get('/api/admin/auditLogs');
      setAuditLogs(res.data);
    } catch (err) {
      console.error('Audit log fetch error:', err);
    }
  }

  const filteredFilings = filings.filter((f) => {
    if (filter === 'All') return true;
    return f.payoutStatus === filter;
  });

  return (
    <div className="admin-vault">
      <h2>🗝️ Admin Vault: Signed Filings & Payouts</h2>

      <label>
        Filter by Payout Status:{' '}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
        </select>
      </label>

      {filteredFilings.length === 0 ? (
        <p>No filings match the selected filter.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Submission ID</th>
              <th>Refund Credits</th>
              <th>Signed At</th>
              <th>Payout Status</th>
              <th>Payout Queued At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFilings.map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{f.refundEstimate}</td>
                <td>{new Date(f.signedAt).toLocaleString()}</td>
                <td>{f.payoutStatus || '—'}</td>
                <td>{f.payoutQueuedAt ? new Date(f.payoutQueuedAt).toLocaleString() : '—'}</td>
                <td>
                  <button onClick={() => updateStatus(f.id, 'Completed')}>✔️ Mark Completed</button>
                  <button onClick={() => updateStatus(f.id, 'Failed')}>❌ Mark Failed</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section className="wallet-manager">
        <h3>💰 Wallet Manager</h3>
        <label>
          Pi Wallet:
          <input value={wallets.pi} onChange={(e) => setWallets({ ...wallets, pi: e.target.value })} />
        </label>
        <label>
          ETH Wallet:
          <input value={wallets.eth} onChange={(e) => setWallets({ ...wallets, eth: e.target.value })} />
        </label>
        <button onClick={saveWallets}>💾 Save Wallets</button>
      </section>

      <section className="fee-log">
        <h3>📊 Fee Payment Logs</h3>
        <ul>
          {feeLogs.map((log, i) => (
            <li key={i}>
              {log.userId} paid {log.amount} {log.currency} on {new Date(log.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>

      <section className="audit-log">
        <h3>🧠 Audit Trail</h3>
        <ul>
          {auditLogs.map((log, i) => (
            <li key={i}>
              [{new Date(log.timestamp).toLocaleString()}] {log.event} (User: {log.userId || '—'})
            </li>
          ))}
        </ul>
      </section>

      <style jsx>{`
        .admin-vault {
          padding: 2rem;
          background: #0f131f;
          color: #e1e8fc;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(118, 198, 255, 0.3);
        }
        table {
          width: 100%;
          margin-top: 1rem;
          border-collapse: collapse;
        }
        th, td {
          padding: 0.5rem;
          border-bottom: 1px solid #2c3448;
        }
        .wallet-manager, .fee-log, .audit-log {
          margin-top: 2rem;
          background: #1c2232;
          padding: 1rem;
          border-radius: 10px;
          box-shadow: 0 0 15px rgba(72, 178, 255, 0.2);
        }
        input {
          margin-left: 0.5rem;
          padding: 0.5rem;
          border-radius: 6px;
          border: none;
          background: #2c3448;
          color: #e1e8fc;
        }
        button {
          margin-top: 0.5rem;
          background: #1e2a3f;
          color: #e1e8fc;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(118, 198, 255, 0.2);
        }
        h3 {
          color: #78c1ff;
        }
      `}</style>
    </div>
  );
}