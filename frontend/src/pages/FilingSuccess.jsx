// death-and-taxes/src/pages/Questionnaire/FilingSuccess.jsx

import React, { useState } from 'react';

export default function FilingSuccess({ filingId, submittedAt }) {
  const formattedTime = new Date(submittedAt).toLocaleString();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const res = await fetch(`/api/controllers/downloadController?filingId=${filingId}`);

      if (!res.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `filing-${filingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error:', err);
      setDownloadError('❌ Could not download filing receipt.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="filing-success">
      <h2>✅ Filing Submitted Successfully</h2>
      <p>Your submission was received and staged for processing.</p>

      <div className="success-details">
        <p><strong>Filing ID:</strong> {filingId}</p>
        <p><strong>Submitted At:</strong> {formattedTime}</p>
      </div>

      <button className="primary-btn" onClick={handleDownload} disabled={isDownloading}>
        {isDownloading ? 'Downloading...' : 'Download Receipt PDF'}
      </button>

      {downloadError && (
        <p className="download-error">{downloadError}</p>
      )}
    </div>
  );
}