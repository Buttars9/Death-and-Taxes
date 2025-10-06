import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../auth/authStore';

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 🔒 Toggle state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const baseURL = import.meta.env.VITE_API_BASE;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError('Email and password required.');
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${baseURL}/api/login`, // ✅ Environment-aware backend call
        { email, password },
        {
          withCredentials: true, // ✅ Send cookie
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        onSuccess?.(res.data.user.id);
      } else {
        setError('Unexpected response.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed.';
      console.error('[LOGIN ERROR]', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} style={styles.form}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={styles.input}
      />
      <div style={styles.passwordWrapper}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          style={styles.eyeButton}
          aria-label="Toggle password visibility"
        >
          {showPassword ? '🔓' : '🔒'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p style={styles.forgot}>
        <a href="/reset-password" style={styles.link}>
          Forgot your password?
        </a>
      </p>
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
    width: '100%',
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#a166ff',
    fontSize: '1.2rem',
    cursor: 'pointer',
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
  forgot: {
    marginTop: '0.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  link: {
    color: '#a166ff',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};