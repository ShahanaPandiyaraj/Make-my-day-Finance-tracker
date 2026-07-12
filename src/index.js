 import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

// Service worker registration is intentionally omitted.
// Re-enable only if you scaffold a real public/service-worker.js
// (e.g. via a Workbox/CRA PWA template) — registering a path that
// doesn't exist in the build output causes a silent MIME-type
// error and console noise on every load.
