import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Wait for Pi SDK to load
const initPiSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.Pi) {
      try {
        const isTestnet = import.meta.env.VITE_IS_TESTNET === 'true';
        console.log('VITE_IS_TESTNET from env:', import.meta.env.VITE_IS_TESTNET);
        console.log('Initializing Pi SDK with sandbox:', isTestnet);
        window.Pi.init({
          version: '2.0',
          sandbox: isTestnet
        });
        console.log('Pi SDK initialized:', window.Pi);
        console.log('Pi SDK sandbox mode:', window.Pi.sandbox);
        resolve();
      } catch (err) {
        console.error('Pi SDK init failed:', err);
        reject(err);
      }
    } else {
      console.error('Pi SDK not loaded. Retrying...');
      setTimeout(() => initPiSDK().then(resolve).catch(reject), 100);
    }
  });
};

initPiSDK().catch(err => console.error('Failed to initialize Pi SDK:', err));

// Fix discarding messages from sandbox origin
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

window.addEventListener('unload', () => {
  window.removeEventListener('message', messageListener);
});