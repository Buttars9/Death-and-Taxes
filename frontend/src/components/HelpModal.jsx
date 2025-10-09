import React from 'react';
import PropTypes from 'prop-types';
import { helpContent } from './helpContent';
import './HelpIcon.css';

export default function HelpModal({ topic, onClose }) {
  let content;
if (topic.includes('.')) {
  const [section, key] = topic.split('.');
  content = helpContent?.[section]?.[key];
} else {
  content = helpContent?.[topic];
}
  if (!content) return null;
console.log('Modal content:', content);
  return (
    <div
  className="help-modal-overlay"
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
      <div className="help-modal">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{
              fontSize: '1.25rem', // smaller size
              color: '#00ffc3',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginRight: '0.75rem',
            }}
          >
            ✖
          </button>
          <h2 className="help-title">{content.title}</h2>
        </div>
        <p className="help-body">{content.body}</p>
      </div>
    </div>
  );
}

HelpModal.propTypes = {
  topic: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};