import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe LocalStorage patch to prevent QuotaExceededError crashes globally
(function patchLocalStorage() {
  try {
    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = function (key: string, value: string) {
      try {
        originalSetItem.call(window.localStorage, key, value);
      } catch (e: any) {
        console.warn(`[SafeLocalStorage] Failed to set "${key}" in localStorage. Quota exceeded or private browsing active:`, e);
      }
    };
  } catch (err) {
    console.error("Failed to patch localStorage:", err);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
