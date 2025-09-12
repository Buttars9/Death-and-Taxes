import React, { useEffect, useState } from 'react';
import { useAnswers } from '../hooks/useAnswers';
import PiBadge from '../components/PiBadge';

export default function FinalWillPage() {
  const { verdict } = useAnswers();
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState(null);

  useEffect(() => {
    if (verdict) {
      fetch('/api/logEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'viewed_final_will',
          timestamp: Date.now(),
          userId: verdict?.userId,
        }),
      });
    }
  }, [verdict]);

  if (!verdict) return <p>Loading will...</p>;

  const { name, state, provisions = [], taxVerdict } = verdict;

  const handlePrint = () => {
    window.print();
  };

  const handleConfirm = async () => {
    const timestamp = Date.now();
    setConfirmed(true);
    setConfirmedAt(timestamp);

    try {
      await fetch('/api/logEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'confirmed_final_will',
          timestamp,
          userId: verdict?.userId,
          estateSummary: provisions,
          taxStrategy: taxVerdict?.recommendedStrategy,
        }),
      });

      // Optional: trigger fee routing
      // await fetch('/api/confirmWillAndTriggerPayment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId: verdict?.userId }),
      // });
    } catch (err) {
      console.error('🧾 Will confirmation logging failed:', err);
    }
  };

  return (
    <div className="final-will">
      <h1>Your Final Will Summary</h1>

      <section>
        <p><strong>Prepared for:</strong> {name}</p>
        <p><strong>State of Residence:</strong> {state}</p>
      </section>

      <section>
        <h2>Estate Provisions</h2>
        {provisions.length > 0 ? (
          <ul>
            {provisions.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        ) : (
          <p>No provisions listed. Please return to the estate planner to complete your will.</p>
        )}
      </section>

      {taxVerdict && (
        <section className="tax-summary">
          <h2>🧾 Tax Deduction Strategy Embedded</h2>
          <p><strong>Recommended:</strong> {taxVerdict.recommendedStrategy === 'standard' ? 'Standard Deduction' : 'Itemized Deduction'}</p>
          <p><strong>Standard Amount:</strong> ${taxVerdict.standardAmount.toLocaleString()}</p>
          <p><strong>Itemized Total:</strong> ${taxVerdict.itemizedTotal.toLocaleString()}</p>
          <p><strong>Why:</strong> {taxVerdict.reasoning}</p>
          <p>This strategy has been embedded in your estate file for transparency and future-proofing.</p>
        </section>
      )}

      <section className="actions">
        <button onClick={handlePrint}>🖨️ Print or Save PDF</button>
        {!confirmed ? (
          <button onClick={handleConfirm}>✅ Confirm This Will</button>
        ) : (
          <p className="confirmed">
            ✅ Will confirmed and saved.
            {confirmedAt && (
              <span> (at {new Date(confirmedAt).toLocaleString()})</span>
            )}
          </p>
        )}
      </section>

      <footer className="footer">
        <PiBadge />
      </footer>

      <style jsx>{`
        .final-will {
          padding: 2rem;
          background: #0f131f;
          color: #e1e8fc;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(118, 198, 255, 0.3);
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        h2 {
          margin-top: 2rem;
          font-size: 1.5rem;
          color: #78c1ff;
        }
        section {
          margin-top: 1rem;
        }
        ul {
          margin-left: 1rem;
          padding-left: 1rem;
          list-style-type: disc;
        }
        .tax-summary {
          margin-top: 2rem;
          background: #1c2232;
          padding: 1rem;
          border-radius: 10px;
          box-shadow: 0 0 15px rgba(72, 178, 255, 0.2);
        }
        .actions {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        button {
          background: #1e2a3f;
          color: #e1e8fc;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(118, 198, 255, 0.2);
        }
        .confirmed {
          color: #78ffb4;
          font-weight: bold;
        }
        .footer {
          margin-top: 3rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}