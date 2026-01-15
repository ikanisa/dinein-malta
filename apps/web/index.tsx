import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './i18n/config'; // Initialize i18n
import App from './App';

// Register service worker with auto-update
registerSW({
  onNeedRefresh() {
    // Dispatch event for UpdatePrompt component to handle
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegistered(registration) {
    console.log('SW registered');
    // Check for updates every hour
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.error('SW registration error:', error);
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);