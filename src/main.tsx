import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silence benign Vite HMR WebSocket connection errors expected in sandboxed preview environments
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || (typeof event.reason === 'string' ? event.reason : '');
    if (message.includes('WebSocket closed') || message.includes('failed to connect to websocket')) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
