import React from 'react';
import PropTypes from 'prop-types';
import { helpContent } from './helpContent';
import './HelpIcon.css';

export default function HelpModal({ topic, onClose }) {
  const [section, key] = topic.split('.');
  const content = helpContent?.[section]?.[key];

  if (!content) return null;

  return (
    <div className="help-modal-overlay">
      <div className="help-modal">
        <button
          onClick={onClose}
          style={{
            fontSize: '1.25rem', // smaller size
            color: '#00ffc3',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
          }}
        >
          ✖
        </button>
        <h2 className="help-title">{content.title}</h2>
        <p className="help-body">{content.body}</p>
      </div>
    </div>
  );
}

HelpModal.propTypes = {
  topic: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};