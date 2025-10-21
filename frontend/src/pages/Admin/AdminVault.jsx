import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminVault() {
  const [filings, setFilings] = useState([]);
  const [filter, setFilter] = useState('All');
  const [wallets, setWallets] = useState({ pi: '', eth: '', btc: '' });
  const [feeLogs, setFeeLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [drakeCount, setDrakeCount] = useState(0);
  const [paymentSummary, setPaymentSummary] = useState({
    pi: 0,
    eth: 0,
    btc: 0,
    stripe: 0,
    paypal: 0,
    venmo: 0,
  });

  useEffect(() => {
    fetchVault();
    fetchWallets();
    fetchFeeLogs();
    fetchAuditLogs();
    fetchUserCount();
    fetchDrakeCount();
    fetchPaymentSummary();
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

  async function confirmPiPayment(id) {
    try {
      await axios.post(`/api/vault/confirm/${id}`, {
        adminCode: '4546314',
        paymentConfirmed: true,
      });
      fetchVault();
    } catch (err) {
      console.error('Pi payment confirm error:', err);
    }
  }

  async function saveWallets() {
    try {
      await axios.post('/api/settings/wallet', { wallet: wallets });
      alert('Wallets saved.');
    } catch (err) {
      console.error('Wallet save error:', err);
    }
  }

  async function fetchWallets() {
  try {
    const res = await axios.get('/api/settings/wallet');
    setWallets(res.data);
  } catch (err) {
    console.error('Wallet fetch error:', err);
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

  async function fetchUserCount() {
    try {
      const res = await axios.get('/api/admin/userCount');
      setUserCount(res.data.count);
    } catch (err) {
      console.error('User count fetch error:', err);
    }
  }

  async function fetchDrakeCount() {
    try {
      const res = await axios.get('/api/admin/drakeSubmissions');
      setDrakeCount(res.data.count);
    } catch (err) {
      console.error('Drake submission count error:', err);
    }
  }

  async function fetchPaymentSummary() {
    try {
      const res = await axios.get('/api/admin/paymentSummary');
      setPaymentSummary(res.data);
    } catch (err) {
      console.error('Payment summary fetch error:', err);
    }
  }

  const filteredFilings = filings.filter((f) => {
    if (filter === 'All') return true;
    return f.payoutStatus === filter;
  });

  return (
    <>
      <style jsx>{`
        .admin-vault {
          padding: 2rem;
          background: #0f131f;
          color: #e1e8fc;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(118, 198, 255, 0.3);
        }
        .stats {
          margin-bottom: 1.5rem;
        }
        .stats p {
          margin: 0.5rem 0;
        }
        .filter-label {
          display: block;
          margin-bottom: 1rem;
        }
        .filter-select {
          padding: 0.5rem;
          border-radius: 6px;
          background: #1c2232;
          color: #e1e8fc;
          border: 1px solid #3a3f55;
        }
        .no-filings {
          margin-top: 1rem;
          font-style: italic;
        }
        table {
          width: 100%;
          margin-top: 1rem;
          border-collapse: collapse;
        }
        th, td {
          padding: 0.5rem;
          border-bottom: 1px solid #2c3448;
          text-align: left;
        }
        .pi-sender {
          color: #78c1ff;
        }
        .wallet-manager,
        .payment-summary,
        .fee-log,
        .audit-log {
          margin-top: 2rem;
          background: #1c2232;
          padding: 1rem;
          border-radius: 10px;
          box-shadow: 0 0 15px rgba(72, 178, 255, 0.2);
        }
        .wallet-manager label {
          display: block;
          margin-bottom: 1rem;
        }
        .wallet-manager input {
          margin-left: 0.5rem;
          padding: 0.5rem;
          border-radius: 6px;
          border: none;
          background: #2c3448;
          color: #e1e8fc;
          width: calc(100% - 1rem);
        }
        .wallet-manager button,
        .submission-complete button {
          margin-top: 0.5rem;
          background: #1e2a3f;
          color: #e1e8fc;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(118, 198, 255, 0.2);
        }
        .payment-summary ul,
        .fee-log ul,
        .audit-log ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .payment-summary ul li,
        .fee-log ul li,
        .audit-log ul li {
          margin-bottom: 0.5rem;
        }
        h3 {
          color: #78c1ff;
          margin-bottom: 1rem;
        }
        @media (max-width: 768px) {
          .admin-vault {
            padding: 1rem;
          }
          .stats p {
            font-size: 0.9rem;
          }
          .filter-label {
            font-size: 0.9rem;
          }
          .filter-select {
            width: 100%;
            padding: 0.4rem;
          }
          table {
            font-size: 0.85rem;
            overflow-x: auto;
            display: block;
          }
          th, td {
            padding: 0.4rem;
            white-space: nowrap;
          }
          .wallet-manager,
          .payment-summary,
          .fee-log,
          .audit-log {
            padding: 0.75rem;
          }
          .wallet-manager label {
            font-size: 0.9rem;
          }
          .wallet-manager input {
            padding: 0.4rem;
            width: calc(100% - 0.8rem);
          }
          .wallet-manager button {
            width: 100%;
            padding: 0.75rem;
          }
          .payment-summary ul li,
          .fee-log ul li,
          .audit-log ul li {
            font-size: 0.85rem;
          }
          h3 {
            font-size: 1.2rem;
            margin-bottom: 0.75rem;
          }
        }
      `}</style>
      <div className="admin-vault">
        <h2>🗝️ Admin Vault: Signed Filings & Payouts</h2>

        <section className="stats">
          <p>👥 Total Users: <strong>{userCount.toLocaleString()}</strong></p>
          <p>📤 Submitted to Drake: <strong>{drakeCount.toLocaleString()}</strong></p>
        </section>

        <label className="filter-label">
          Filter by Payout Status:{' '}
          <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </select>
        </label>

        {filteredFilings.length === 0 ? (
          <p className="no-filings">No filings match the selected filter.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Submission ID</th>
                <th>Refund Credits</th>
                <th>Signed At</th>
                <th>Payout Status</th>
                <th>Payout Queued At</th>
                <th>Claimed Pi Sender</th>
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
                    {f.piSenderAddress ? (
                      <span className="pi-sender">
                        🔔 {f.piSenderAddress}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <button onClick={() => updateStatus(f.id, 'Completed')}>✔️ Mark Completed</button>
                    <button onClick={() => updateStatus(f.id, 'Failed')}>❌ Mark Failed</button>
                    {f.piSenderAddress && !f.paymentConfirmed && (
                      <button onClick={() => confirmPiPayment(f.id)}>✅ Confirm Pi Payment</button>
                    )}
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
          <label>
            BTC Wallet:
            <input value={wallets.btc} onChange={(e) => setWallets({ ...wallets, btc: e.target.value })} />
          </label>
          <button onClick={saveWallets}>💾 Save Wallets</button>
        </section>

        <section className="payment-summary">
          <h3>💳 Payment Breakdown</h3>
          <ul>
            <li>Pi Wallet: ${paymentSummary.pi.toLocaleString()}</li>
            <li>ETH Wallet: ${paymentSummary.eth.toLocaleString()}</li>
            <li>BTC Wallet: ${paymentSummary.btc.toLocaleString()}</li>
            <li>Stripe (Credit Card): ${paymentSummary.stripe.toLocaleString()}</li>
            <li>PayPal: ${paymentSummary.paypal.toLocaleString()}</li>
            <li>Venmo: ${paymentSummary.venmo.toLocaleString()}</li>
          </ul>
        </section>

        <section className="fee-log">
          <h3>📊 Fee Payment Logs</h3>
          <ul>
            {feeLogs.map((log, i) => (
              <li key={i}>
                {log.userId} paid ${log.amount} via {log.method} on {new Date(log.timestamp).toLocaleString()}
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
      </div>
    </>
  );
}