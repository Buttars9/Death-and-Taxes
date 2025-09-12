import React from 'react';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      {/* Optional: Add header, nav, or trust banner here */}
      <main>{children}</main>
      {/* Optional: Add footer or legal disclaimer here */}
    </div>
  );
}