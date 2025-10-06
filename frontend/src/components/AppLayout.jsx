import React from 'react';

export default function AppLayout({ children }) {
  return (
    <div
      className="app-layout"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#0e0e0e',
        color: '#f5f5f5',
        fontFamily: 'Inter, sans-serif',
        overflowX: 'hidden',
      }}
    >
      {/* Optional: Add header, nav, or trust banner here */}
      <main
        style={{
          flex: 1,
          padding: '1rem',
          maxWidth: '100%',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>
      {/* Optional: Add footer or legal disclaimer here */}
    </div>
  );
}