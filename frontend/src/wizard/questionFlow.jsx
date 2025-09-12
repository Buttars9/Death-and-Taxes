import React, { useState, useEffect } from 'react';
import taxQuestions from '../questions/taxQuestions';
import willQuestions from '../questions/willQuestions';
import willifyAnswers from '../../../server/utils/willifyAnswers';
import { useAnswers } from '../hooks/useAnswers';
import { useRouter } from 'next/router';

export default function QuestionFlowPage({ parsedFields = {} }) {
  const [responses, setResponses] = useState({});
  const { setVerdict } = useAnswers();
  const router = useRouter();

  // Auto-fill responses from parsedFields on first load
  useEffect(() => {
    if (Object.keys(parsedFields).length > 0) {
      setResponses(prev => ({ ...prev, ...parsedFields }));
    }
  }, [parsedFields]);

  const handleChange = (key, value) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const verdict = willifyAnswers(responses);
    setVerdict(verdict);
    router.push('/refundVerdict');
  };

  const allQuestions = [...taxQuestions, ...willQuestions];

  return (
    <div className="question-flow">
      <h1>Tax & Will Intake</h1>

      {allQuestions.map(q => (
        <div key={q.key} className="question-block">
          <label htmlFor={q.key}>{q.question}</label>

          {q.type === 'numeric' && (
            <input
              id={q.key}
              type="number"
              value={responses[q.key] || ''}
              onChange={e => handleChange(q.key, parseFloat(e.target.value))}
            />
          )}

          {q.type === 'text' && (
            <input
              id={q.key}
              type="text"
              value={responses[q.key] || ''}
              onChange={e => handleChange(q.key, e.target.value)}
            />
          )}

          {q.type === 'singleSelect' && (
            <select
              id={q.key}
              value={responses[q.key] || ''}
              onChange={e => handleChange(q.key, e.target.value.toLowerCase())}
            >
              <option value="">Select</option>
              {q.options.map(opt => (
                <option key={opt} value={opt.toLowerCase()}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {q.type === 'multiSelect' && (
            <div className="multi-select-group">
              {q.options.map(opt => {
                const normalized = opt.toLowerCase();
                const current = responses[q.key] || [];
                const isChecked = current.includes(normalized);

                return (
                  <label key={opt} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        const newVal = e.target.checked
                          ? [...current, normalized]
                          : current.filter(v => v !== normalized);
                        handleChange(q.key, newVal);
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <button className="submit-button" onClick={handleSubmit}>
        Submit Answers
      </button>

      {/* Styles unchanged */}
    </div>
  );
}