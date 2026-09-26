import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {registerSW} from 'virtual:pwa-register';

// Register PWA service worker for offline caching & installability
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('FluentAI: New version available');
  },
  onOfflineReady() {
    console.log('FluentAI: Offline mode ready');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
