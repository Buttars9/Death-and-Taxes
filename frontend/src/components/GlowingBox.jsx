import React from 'react';

export default function GlowingBox({ children }) {
  return (
    <div
      style={{
        padding: '2rem',
        background: '#0f131f',
        borderRadius: '12px',
       
      }}
    >
      {children}
    </div>
  );
}