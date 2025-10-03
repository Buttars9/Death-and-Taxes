/**
 * Renders a readable preview of the IRS payload.
 * Lets users confirm before final submission.
 * Reinforces trust and transparency in guided flow.
 */

import React from 'react';
import PropTypes from 'prop-types';
import generateIrsPdf from '../shared/utils/generateIrsPdf.js'; // ✅ default import
import './IrsPayloadPreview.css';

export function IrsPayloadPreview({ payload, onConfirm }) {
  const { json, xml } = payload || {};

  if (!json || typeof json !== 'object') {
    return <div className="irs-preview">No IRS payload to display.</div>;
  }

  const handleDownload = () => {
    const doc = generateIrsPdf({ json });
    doc.save('IRS-Filing.pdf');
  };

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return value.map((item, i) => (
        <div key={i} style={{ marginLeft: '1rem' }}>
          {typeof item === 'object'
            ? <pre style={{ margin: 0 }}>{JSON.stringify(item, null, 2)}</pre>
            : formatValue(item)}
        </div>
      ));
    }

    if (typeof value === 'object' && value !== null) {
      return <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>;
    }

    return formatValue(value);
  };

  return (
    <div className="irs-preview">
      <h2>IRS Filing Preview</h2>

      {Object.entries(json).map(([form, lines]) => (
        <div key={form} className="irs-form-block">
          <h3>Form {form}</h3>
          <ul>
            {Object.entries(lines).map(([line, value]) => (
              <li key={line}>
                <strong>Line {line}:</strong>{' '}
                {renderValue(value)}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {xml && (
        <div className="irs-xml-block">
          <h3>IRS XML Payload</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{xml}</pre>
        </div>
      )}

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
  payload: PropTypes.shape({
    json: PropTypes.object.isRequired,
    xml: PropTypes.string,
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
};