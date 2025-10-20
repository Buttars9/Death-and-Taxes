import React from 'react';
import PropTypes from 'prop-types';
import jsPDF from 'jspdf'; // Added for PDF generation
import './IrsPayloadPreview.css'; // Reuse styles or create StatePayloadPreview.css if needed

export function StatePayloadPreview({ payload, onConfirm }) {
  const { json, xml } = payload || {};

  if (!json || typeof json !== 'object') {
    return <div className="irs-preview">No state payload to display.</div>; // Updated message
  }

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text(JSON.stringify(json, null, 2), 10, 10); // Simple JSON dump to PDF
    doc.save('State-Filing.pdf'); // Updated filename
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
    <div className="irs-preview"> {/* Reuse class or update to state-preview */}
      <h2>State Filing Preview</h2> {/* Updated title */}

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
          <h3>State XML Payload</h3> {/* Updated header */}
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

StatePayloadPreview.propTypes = {
  payload: PropTypes.shape({
    json: PropTypes.object.isRequired,
    xml: PropTypes.string,
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
};