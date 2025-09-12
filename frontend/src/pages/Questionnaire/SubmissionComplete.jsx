// death-and-taxes/src/pages/Questionnaire/SubmissionComplete.jsx

import React from 'react';

export default function SubmissionComplete({ confirmationId, submittedAt, onGoToDashboard }) {
  const formattedTime = submittedAt
    ? new Date(submittedAt).toLocaleString()
    : null;

  return (
    <div className="questionnaire-step submission-complete">
      <h2 className="step-title">You Did It 🎉</h2>
      <p className="step-description">
        Your filing is complete and securely queued. We’ll notify you as it moves through review and disbursement.
      </p>

      <div className="completion-details">
        {confirmationId && (
          <p><strong>Confirmation ID:</strong> {confirmationId}</p>
        )}
        {formattedTime && (
          <p><strong>Submitted At:</strong> {formattedTime}</p>
        )}
        <p><strong>What’s next?</strong></p>
        <ul>
          <li>You can log in anytime to check your refund status</li>
          <li>We’ll email or message you when review is complete</li>
          <li>Your refund will be sent to the account you provided</li>
        </ul>
      </div>

      <p className="gratitude-note">
        Thanks for trusting Pi—your journey is just beginning.
      </p>

      <button className="dashboard-button" onClick={onGoToDashboard}>
        Go to Dashboard
      </button>
    </div>
  );
}