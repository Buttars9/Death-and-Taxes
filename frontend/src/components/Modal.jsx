import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

export default function Modal({ children, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose} style={closeButtonStyle}>Close</button>
      </div>
    </div>
  );
}

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

const backdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: '#1a0028',
  color: '#e0e0ff',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 0 20px #8c4dcc',
  maxWidth: '800px',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: '#3f8cff',
  color: '#fff',
  border: 'none',
  padding: '0.4rem 0.8rem',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
};