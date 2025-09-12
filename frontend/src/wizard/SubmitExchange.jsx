import React, { useState } from 'react';
import axios from 'axios';
import FilingStatus from '../components/FilingStatus';
import { useWizardStore } from '../stores/wizardStore'; // 🪦 Estate inputs

export default function SubmitExchange() {
  const [formPayload, setFormPayload] = useState({});
  const [submissionId, setSubmissionId] = useState(null);

  const { willData } = useWizardStore(); // 🧠 Pull from store

  const handleSubmit = async () => {
    try {
      const fullPayload = {
        ...formPayload,
        estate: willData, // 🔐 Trust-first estate data
      };

      const res = await axios.post('/api/filing/submit', fullPayload);
      setSubmissionId(res.data.submissionId);
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  return (
    <div className="submit-exchange">
      <h2>Submit Your Filing</h2>

      {/* Add your form inputs here */}
      {/* Example: <input onChange={...} value={formPayload.firstName || ''} /> */}

      <button onClick={handleSubmit}>Submit</button>

      {/* Conditional Status Tracker */}
      {submissionId && <FilingStatus submissionId={submissionId} />}
    </div>
  );
}