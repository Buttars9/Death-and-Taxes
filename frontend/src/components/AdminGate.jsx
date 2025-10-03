import React, { useState } from 'react';
import AdminVault from "../pages/Admin/AdminVault.jsx";

export default function AdminGate() {
  const [pin, setPin] = useState('');
  
 function handleSubmit(e) {
  e.preventDefault();
  if (pin === '4546') {
    window.location.href = '/admin/vault';
  } else {
    alert('Access denied.');
  }
}
  return (
    <div style={{
      padding: '2rem',
      background: '#0f131f',
      color: '#e1e8fc',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <h2>🛡️ Admin Access Required</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          style={{
            padding: '0.5rem',
            fontSize: '1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: '#1c2232',
            color: '#e1e8fc',
          }}
        />
        <button
          type="submit"
          style={{
            marginLeft: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '8px',
            background: '#78c1ff',
            color: '#0f131f',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Unlock
        </button>
      </form>
    </div>
  );
}