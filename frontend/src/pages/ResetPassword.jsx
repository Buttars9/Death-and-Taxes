import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, []);

  const baseURL = import.meta.env.VITE_API_BASE;

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${baseURL}/api/request-reset`,
        { email },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (res.data.success) {
        setStatus('✅ Reset link sent. Check your email or console.');
      } else {
        setStatus('⚠️ Unexpected response.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Request failed.';
      console.error('[REQUEST RESET ERROR]', msg);
      setStatus(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${baseURL}/api/reset-password`,
        { token, newPassword },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (res.data.success) {
        setStatus('✅ Password reset successful. Redirecting to login...');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setStatus('⚠️ Unexpected response.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Reset failed.';
      console.error('[RESET ERROR]', msg);
      setStatus(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Reset Your Password</h2>

      {!token ? (
        <form onSubmit={handleRequestReset} style={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} style={styles.form}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      )}

      {status && <p style={styles.status}>{status}</p>}
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
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: 'Segoe UI, sans-serif',
  },
  title: {
    fontSize: '1.8rem',
    marginBottom: '1rem',
    color: '#a166ff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    maxWidth: '400px',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    background: '#2a0033',
    color: '#ffffff',
    fontSize: '1rem',
    boxShadow: '0 0 12px #a166ff',
  },
  button: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    background: '#a166ff',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 0 12px rgba(161, 102, 255, 0.4)',
  },
  status: {
    marginTop: '1rem',
    fontSize: '0.95rem',
    color: '#ffcccc',
    textAlign: 'center',
  },
};