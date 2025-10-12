import React from 'react';

export default function GlowingBox({ children }) {
  return (
    <>
      <style>{`
        .glowing-box {
          padding: 2rem;
          background: #0f131f;
          border-radius: 12px;
        }
        @media (max-width: 768px) {
          .glowing-box {
            padding: 1rem;
          }
        }
      `}</style>
      <div className="glowing-box">
        {children}
      </div>
    </>
  );
}