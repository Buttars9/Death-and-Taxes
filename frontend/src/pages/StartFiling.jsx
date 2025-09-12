import React from 'react';
import { Link } from 'react-router-dom';
import PoweredByPi from '../components/PoweredByPi';
import '../styles/startFiling.css';

export default function StartFiling() {
  return (
    <div className="start-filing-container">
      <div className="intro-box glow-frame">
        <h1 className="intro-header">Welcome to Death and Taxes</h1>

        <p className="intro-subtext">
          This isn’t your typical tax prep. We combine financial clarity with crypto-grade precision—
          guided, secure, and always transparent.
        </p>

        <div className="escrow-preview">
          <span>💡 All payout and escrow estimates use real-time market data—no stale math, no hidden fees.</span>
        </div>

        <Link to="/questionnaire" className="start-filing-link">
          <button className="start-filing-btn primary">Begin Filing</button>
        </Link>

        <PoweredByPi />
      </div>

      <style jsx>{`
        .start-filing-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: radial-gradient(circle at top, #0f131f, #0a0e17);
        }

        .intro-box {
          max-width: 600px;
          padding: 2rem;
          background: #1c2232;
          color: #e1e8fc;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(118, 198, 255, 0.3);
          text-align: center;
        }

        .intro-header {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #00ffc3;
        }

        .intro-subtext {
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .escrow-preview {
          margin-bottom: 2rem;
          font-size: 0.95rem;
          color: #a0b8ff;
        }

        .start-filing-btn {
          padding: 0.75rem 1.5rem;
          background: #00ffc3;
          color: #000;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(0, 255, 195, 0.4);
          transition: transform 0.2s ease;
        }

        .start-filing-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}