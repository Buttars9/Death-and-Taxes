import React, { useEffect, useState } from 'react';
import { useAuthStore } from './auth/authStore';
import { useNavigate } from 'react-router-dom';
import AuthForm from './auth/AuthForm';

export default function DeathAndTaxes() {
  const user = useAuthStore((s) => s.user);
  const rehydrate = useAuthStore((s) => s.rehydrate);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    rehydrate().finally(() => {
      setLoading(false);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready && user) {
      navigate('/dashboard');
    }
  }, [ready, user, navigate]);

  if (loading) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center' }}>
        <p style={{ color: '#a166ff', fontSize: '1.2rem' }}>Loading Pi-powered session…</p>
      </div>
    );
  }

  return (
  <>
    <style>{`/* 👇 Glowing styles preserved */ 
      @keyframes piPulse {
        0% { text-shadow: 0 0 6px #a166ff; }
        50% { text-shadow: 0 0 12px #a166ff; }
        100% { text-shadow: 0 0 6px #a166ff; }
      }

      @keyframes boxGlow {
        0% { box-shadow: 0 0 6px #a166ff; }
        50% { box-shadow: 0 0 16px #a166ff; }
        100% { box-shadow: 0 0 6px #a166ff; }
      }

      .pi-symbol {
        font-size: 1.3rem;
        margin-right: 6px;
        animation: piPulse 4s ease-in-out infinite;
        color: #a166ff;
      }

      .powered-header {
        position: absolute;
        top: 20px;
        left: 20px;
        display: flex;
        align-items: center;
        font-size: 1rem;
        color: white;
        font-weight: bold;
      }

      .glowing-card {
        background-color: #1a0026;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 0 12px #a166ff;
        animation: boxGlow 6s infinite;
        border: 1px solid rgba(178, 102, 255, 0.4);
        width: 440px;
        text-align: center;
      }

      .auth-button {
        flex: 1;
        height: 42px;
        background-color: black;
        border-radius: 10px;
        color: white;
        font-size: 0.9rem;
        font-weight: bold;
        box-shadow: 0 0 12px #a166ff;
        animation: boxGlow 6s infinite;
        border: none;
        cursor: pointer;
        transition: transform 0.2s ease;
        padding: 0 14px;
      }

      .auth-button:hover {
        transform: scale(1.05);
      }

      .button-row {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .promo-banner {
        margin-top: 2rem;
        background: linear-gradient(to right, #2a0f3d, #1a0b2a);
        border-bottom: 1px solid #4b2b6b;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        font-size: 1.1rem;
        font-weight: 600;
        text-align: center;
        text-shadow: 0 0 6px rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 12px rgba(255, 255, 255, 0.05);
        color: #ffffff;
      }

      input::placeholder {
        color: #ffffff;
        opacity: 1;
      }

      /* Mobile responsiveness fixes */
      @media (max-width: 480px) {
        .powered-header {
          top: 10px;
          left: 10px;
          font-size: 0.9rem;
        }

        .glowing-card {
          width: 100%; /* Flexible width for mobile */
          max-width: 100%;
          padding: 1.5rem; /* Reduce padding */
        }

        .button-row {
          flex-direction: column; /* Stack buttons vertically */
          gap: 0.75rem;
        }

        .auth-button {
          width: 100%; /* Full-width buttons */
          font-size: 0.85rem;
        }

        .promo-banner {
          padding: 0.75rem 1rem;
          font-size: 1rem;
        }
      }
    `}</style>

    <div style={styles.container}>
      {/* 🔐 Pi symbol admin access button */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => window.location.href = '/admin'}
          title="Admin Access"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.8rem',
            color: '#a166ff',
            cursor: 'pointer',
            animation: 'piPulse 4s ease-in-out infinite',
          }}
        >
          ℼ
        </button>
      </div>

      <div className="powered-header">
        <span className="pi-symbol">ℼ</span> Powered by Pi Network
      </div>

      <div className="glowing-card">
        <h1 style={styles.title}>Death and Taxes</h1>
        <p style={styles.subtitle}>the two certain things in life</p>

        <AuthForm
          onSuccess={() => {
            const agreed = localStorage.getItem('termsAccepted') === 'true';
            navigate(agreed ? '/dashboard' : '/terms');
          }}
        />
      </div>

  <div className="promo-banner">
  <strong>
    $74.99 includes federal/state filing + a will.<br />
    $99.99 includes federal/state filing + full estate plan.<br />
    Cheaper than other tax apps and estate lawyers.
  </strong><br />
  <span style={{ fontSize: '0.95rem', color: '#ffffff' }}>
    Pay with Pi, crypto, PayPal, and other forms — get your refund and your legacy sorted.
  </span>
</div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem', color: '#ffffff' }}>
        Need help? Call <strong>Customer Service: 1.888.555.0199</strong>
      </div>
    </div>
  </>
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
    position: 'relative',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    color: '#8c4dcc',
  },
  subtitle: {
    fontSize: '1rem',
    marginBottom: '2rem',
    color: '#ffffff',
    fontStyle: 'italic',
    textTransform: 'lowercase',
  },
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
  error: {
    color: '#ff6666',
    marginTop: '1rem',
  },
};