// src/components/PiBadge.jsx

import React from 'react';
import './PiBadge.css';

export default function PiBadge({ size = 48, animated = true }) {
  return (
    <div
      className={`pi-badge ${animated ? 'glow-pulse' : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at center, #fffcf5, #f5c542)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.6,
        fontWeight: 'bold',
        color: '#2c2c2c',
        boxShadow: animated ? '0 0 12px #f5c542' : 'none',
        transition: 'box-shadow 0.3s ease-in-out',
      }}
    >
      π
    </div>
  );
}