import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@styles/globals.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root container #root element not found');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
