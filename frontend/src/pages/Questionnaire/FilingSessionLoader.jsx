// death-and-taxes/src/pages/Questionnaire/FilingSessionLoader.jsx

import { useEffect } from 'react';
import PropTypes from 'prop-types';

export default function FilingSessionLoader({ userId, setAnswers, setStatus }) {
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch(`/loadFilingSession?userId=${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (data?.formData) setAnswers(data.formData);
        if (data?.status) setStatus(data.status);
      } catch (error) {
        console.error('🔒 Trust-first session load failed:', error);
        setStatus('error'); // Optional fallback
      }
    };

    if (userId) loadSession();
  }, [userId, setAnswers, setStatus]);

  return null;
}

FilingSessionLoader.propTypes = {
  userId: PropTypes.string.isRequired,
  setAnswers: PropTypes.func.isRequired,
  setStatus: PropTypes.func.isRequired,
};