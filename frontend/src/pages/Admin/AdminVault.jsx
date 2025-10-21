import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchVault(),
          fetchWallets(),
          fetchFeeLogs(),
          fetchAuditLogs(),
          fetchUserCount(),
          fetchDrakeCount(),
          fetchPaymentSummary(),
        ]);
      } catch (err) {
        setError('Failed to load data. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fetchVault = useCallback(async () => {
    try {
      const res = await axios.get('/api/vault');
      setFilings(res.data);
    } catch (err) {
      console.error('Vault fetch error:', err);
    }
  }, []);

  const updateStatus = useCallback(async (id, newStatus) => {
    try {
      await axios.post(`/api/vault/status/${id}`, { status: newStatus });
      fetchVault();
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status.');
    }
  }, [fetchVault]);

  const confirmPiPayment = useCallback(async (id) => {
    try {
      await axios.post(`/api/vault/confirm/${id}`, {
        adminCode: '4546314',
        paymentConfirmed: true,
      });
      fetchVault();
    } catch (err) {
      console.error('Pi payment confirm error:', err);
      alert('Failed to confirm payment.');
    }
  }, [fetchVault]);

  const saveWallets = useCallback(async () => {
    try {
      await axios.post('/api/settings/wallet', { wallet: wallets });
      alert('Wallets saved.');
    } catch (err) {
      console.error('Wallet save error:', err);
      alert('Failed to save wallets.');
    }
  }, [wallets]);

  const fetchWallets = useCallback(async () => {
    try {
      const res = await axios.get('/api/settings/wallet');
      setWallets(res.data);
    } catch (err) {
      console.error('Wallet fetch error:', err);
    }
  }, []);

  const fetchFeeLogs = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/feeLogs');
      setFeeLogs(res.data);
    } catch (err) {
      console.error('Fee log fetch error:', err);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/auditLogs');
      setAuditLogs(res.data);
    } catch (err) {
      console.error('Audit log fetch error:', err);
    }
  }, []);

  const fetchUserCount = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/userCount');
      setUserCount(res.data.count);
    } catch (err) {
      console.error('User count fetch error:', err);
    }
  }, []);

  const fetchDrakeCount = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/drakeSubmissions');
      setDrakeCount(res.data.count);
    } catch (err) {
      console.error('Drake submission count error:', err);
    }
  }, []);

  const fetchPaymentSummary = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/paymentSummary');
      setPaymentSummary(res.data);
    } catch (err) {
      console.error('Payment summary fetch error:', err);
    }
  }, []);

  const filteredFilings = useMemo(() => filings.filter((f) => filter === 'All' || f.payoutStatus === filter), [filings, filter]);

  if (loading) return <p>Loading admin data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-vault">
      <h2>🗝️ Admin Vault: Signed Filings & Payouts</h2>

      <section className="stats">
        <p>👥 Total Users: <strong>{userCount.toLocaleString()}</strong></p>
        <p>📤 Submitted to Drake: <strong>{drakeCount.toLocaleString()}</strong></p>
      </section>

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
                  {f?.piSenderAddress ? (
                    <span style={{ color: '#78c1ff' }}>
                      🔔 {f.piSenderAddress}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  <button onClick={() => updateStatus(f.id, 'Completed')}>✔️ Mark Completed</button>
                  <button onClick={() => updateStatus(f.id, 'Failed')}>❌ Mark Failed</button>
                  {f?.piSenderAddress && !f?.paymentConfirmed && (
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
  );
}