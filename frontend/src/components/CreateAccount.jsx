import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../auth/authStore';

export default function CreateAccount({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirm) {
      return setError('All fields are required.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError('Invalid email format.');
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    if (password !== confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/register`, // ✅ Dynamic backend URL
        { email, password },
        { withCredentials: true } // ✅ Send cookie
      );

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        onSuccess?.(res.data.user.id);
      } else {
        setError('Unexpected response.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        style={styles.input}
      />

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
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
  error: {
    color: '#ff6666',
    marginTop: '1rem',
  },
};