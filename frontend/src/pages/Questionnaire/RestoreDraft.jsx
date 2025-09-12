// death-and-taxes/src/pages/Questionnaire/RestoreDraft.jsx

import { useEffect } from 'react';
import PropTypes from 'prop-types';

export default function RestoreDraft({ setFormData }) {
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('draftFilingData');
      if (!savedData) return;

      const parsed = JSON.parse(savedData);
      const { payload, savedAt } = parsed;

      if (payload && typeof payload === 'object') {
        setFormData(payload);
        console.log(`📦 Restored draft from ${new Date(savedAt).toLocaleString()}`);
      }
    } catch (error) {
      console.error('🔒 Draft restore failed:', error);
    }
  }, [setFormData]);

  return null;
}

RestoreDraft.propTypes = {
  setFormData: PropTypes.func.isRequired,
};