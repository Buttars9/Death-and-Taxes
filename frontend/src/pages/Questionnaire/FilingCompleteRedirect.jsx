// death-and-taxes/src/pages/Questionnaire/FilingCompleteRedirect.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function FilingCompleteRedirect({ answers, userSession }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!userSession?.isAuthenticated) {
      navigate('/login');
    } else if (answers?.trustConfirmed && answers?.submissionComplete) {
      navigate('/questionnaire/submission-complete');
    } else {
      navigate('/dashboard');
    }
  }, [answers, userSession, navigate]);

  return (
    <div className="filing-redirect-loader">
      <p>Checking your submission status…</p>
    </div>
  );
}

FilingCompleteRedirect.propTypes = {
  answers: PropTypes.object.isRequired,
  userSession: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
  }),
};