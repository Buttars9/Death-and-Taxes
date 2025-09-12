// death-and-taxes/src/pages/Questionnaire/AutoSaveEngine.jsx

import { useEffect } from 'react';
import PropTypes from 'prop-types';

export default function AutoSaveEngine({ answers }) {
  useEffect(() => {
    let lastSaved = '';

    const saveProgress = async () => {
      const payload = JSON.stringify(answers);
      if (payload === lastSaved) return; // 🧠 Skip if unchanged
      lastSaved = payload;

      try {
        localStorage.setItem('draftFilingData', payload);

        // Optional backend sync
        // await fetch('/autosaveFiling', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: payload,
        // });
      } catch (error) {
        console.error('🔒 Auto-save failed:', error);
      }
    };

    const intervalId = setInterval(saveProgress, 5000); // every 5s

    return () => clearInterval(intervalId);
  }, [answers]);

  return null;
}

AutoSaveEngine.propTypes = {
  answers: PropTypes.object.isRequired,
};