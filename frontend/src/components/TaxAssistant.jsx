import React, { useState } from 'react';
import { calculateRefund } from '../shared/utils/refundEngine.js';
import { form1040Payload } from '../shared/utils/form1040Payload.js';

export default function TaxAssistant() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const explainTaxConcept = ({ query, payload }) => {
    const lower = query.toLowerCase();

    if (lower.includes('standard deduction')) {
      return {
        answer: `Your standard deduction is $${payload?.deductions?.amount?.toLocaleString() || '0'}.`
      };
    }

    if (lower.includes('refund')) {
      const refund = calculateRefund({
        state: payload.taxpayer.state,
        filingStatus: payload.taxpayer.filingStatus,
        income: payload.incomeDetails.totalIncome,
        dependents: payload.taxpayer.dependents.length,
      });
      return {
        answer: `Your refund estimate is $${refund.amount.toLocaleString()}.`
      };
    }

    return { answer: 'Sorry, I couldn’t interpret that yet.' };
  };

  const handleAsk = async () => {
    setLoading(true);
    try {
      const result = explainTaxConcept({ query, payload: form1040Payload });
      setResponse(result.answer || 'No answer available.');
    } catch (err) {
      setResponse('⚠️ Error processing your question.');
    }
    setLoading(false);
  };

  return (
    <div className="tax-assistant">
      <h2>🧠 Ask the Tax Assistant</h2>
      <input
        type="text"
        placeholder="e.g. What’s my refund with 3 kids?"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button onClick={handleAsk} disabled={loading}>
        {loading ? 'Thinking…' : 'Ask'}
      </button>

      {response && (
        <div className="response-block">
          <h3>🧾 Response</h3>
          <pre>{response}</pre>
        </div>
      )}

      <style jsx>{`
        .tax-assistant {
          background: #0f131f;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(118, 198, 255, 0.3);
          color: #e1e8fc;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          margin-top: 1rem;
          background: #1c2230;
          border: none;
          border-radius: 6px;
          color: #e1e8fc;
        }
        button {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #00ffe0;
          color: #0f131f;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
        .response-block {
          margin-top: 2rem;
          background: #1c2230;
          padding: 1rem;
          border-radius: 8px;
        }
        pre {
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}