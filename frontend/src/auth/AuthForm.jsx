import { useState } from 'react';
import Login from '../components/Login';
import CreateAccount from '../components/CreateAccount';

export default function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'create'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {mode === 'login' ? (
        <>
          <Login onSuccess={onSuccess} mode={mode} />
          <p style={styles.switch}>
            Don’t have an account?{' '}
            <button onClick={() => setMode('create')} style={styles.link}>
              Create one
            </button>
          </p>
        </>
      ) : (
        <>
          <CreateAccount onSuccess={onSuccess} mode={mode} />
          <p style={styles.switch}>
            Already registered?{' '}
            <button onClick={() => setMode('login')} style={styles.link}>
              Log in
            </button>
          </p>
        </>
      )}
    </div>
  );
}

const styles = {
  switch: {
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#ccc',
    textAlign: 'center',
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#a166ff',
    cursor: 'pointer',
    fontWeight: 'bold',
    textDecoration: 'underline',
    padding: 0,
    fontSize: '0.9rem',
  },
};