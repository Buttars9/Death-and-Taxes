import React from 'react';

export default function GlowingBox({ children }) {
  return (
    <div
      style={{
        padding: '2rem',
        background: '#0f131f',
        borderRadius: '12px',
        boxShadow: '0 0 25px rgba(161, 102, 255, 0.3)',
      }}
    >
      {children}
    </div>
  );
}