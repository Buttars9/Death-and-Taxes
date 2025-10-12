import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

if (!window.Pi) {
  console.error('Pi SDK not loaded. Ensure pi-sdk.js is included.');
} else {
  window.Pi.init({
    version: '2.0',
    sandbox: import.meta.env.VITE_IS_TESTNET === 'true'
  });
}

const messageListener = (event) => {
  const allowedOrigins = ['https://www.deathntaxes.app'];
  if (window.Pi && window.Pi.sandbox) {
    allowedOrigins.push('https://sandbox.minepi.com');
  }

  if (!allowedOrigins.includes(event.origin)) {
    console.log('Discarding message - origin:', event.origin, '- data is logged below');
    console.log(event.data);
    return;
  }
};

window.addEventListener('message', messageListener);

const root = document.getElementById('root');

if (!root) {
  throw new Error('❌ Root element not found. Check public/index.html for <div id="root">');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Cleanup listener on unmount
window.addEventListener('unload', () => {
  window.removeEventListener('message', messageListener);
});