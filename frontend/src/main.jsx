import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

/**
 * Entry point for Death & Taxes.
 * Wraps app in React.StrictMode for dev safety.
 * Mounts to #root in public/index.html.
 */

const root = document.getElementById('root');

if (!root) {
  throw new Error('❌ Root element not found. Check public/index.html for <div id="root">');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);