/**
 * Renders a readable preview of the IRS payload.
 * Lets users confirm before final submission.
 * Reinforces trust and transparency in guided flow.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { generateIrsPdf } from '../shared/utils/generateIrsPdf.js'; // ✅ FIXED PATH
import './IrsPayloadPreview.css';

export function IrsPayloadPreview({ payload, onConfirm }) {
  if (!payload || typeof payload !== 'object') {
    return <div className="irs-preview">No IRS payload to display.</div>;
  }

  const handleDownload = () => {
    const doc = generateIrsPdf(payload);
    doc.save('IRS-Filing.pdf');
  };

  return (
    <div className="irs-preview">
      <h2>IRS Filing Preview</h2>
      {Object.entries(payload).map(([form, lines]) => (
        <div key={form} className="irs-form-block">
          <h3>Form {form}</h3>
          <ul>
            {Object.entries(lines).map(([line, value]) => (
              <li key={line}>
                <strong>Line {line}:</strong> {formatValue(value)}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="irs-actions">
        <button className="confirm-button" onClick={onConfirm}>
          Confirm and Submit
        </button>
        <button className="download-button" onClick={handleDownload}>
          Download PDF for Mailing
        </button>
      </div>
    </div>
  );
}

function formatValue(val) {
  if (typeof val === 'boolean') return val ? '✓' : '✗';
  if (typeof val === 'number') return `$${val.toFixed(2)}`;
  return String(val);
}

IrsPayloadPreview.propTypes = {
  payload: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
};