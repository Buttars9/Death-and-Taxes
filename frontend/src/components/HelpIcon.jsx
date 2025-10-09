import React from 'react';
import PropTypes from 'prop-types';
import './HelpIcon.css';

export default function HelpIcon({ onClick }) {
  return (
    <button className="help-icon" onClick={onClick} aria-label="Help">
      <span className="pi-symbol glow">?</span>
    </button>
  );
}

HelpIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
};