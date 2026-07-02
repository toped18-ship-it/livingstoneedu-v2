import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
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

const BUILD_VERSION = "BUILD_ID";

// Force updates if build ID changed
(function forceUpdateOnNewBuild() {
  try {
    const currentVersion = BUILD_VERSION;
    const storedVersion = localStorage.getItem("APP_BUILD_VERSION");
    
    if (currentVersion !== "BUILD_ID" && storedVersion && storedVersion !== currentVersion) {
      console.log("[PWA] Detecting new build version: " + currentVersion + ". Purging old cache...");
      localStorage.setItem("APP_BUILD_VERSION", currentVersion);
      
      // Unregister service workers
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      
      // Clear cache storage
      if (typeof caches !== 'undefined') {
        caches.keys().then((keys) => {
          Promise.all(keys.map(key => caches.delete(key))).then(() => {
            window.location.reload();
          });
        });
      } else {
        window.location.reload();
      }
    } else if (currentVersion !== "BUILD_ID" && !storedVersion) {
      localStorage.setItem("APP_BUILD_VERSION", currentVersion);
    }
  } catch (err) {
    console.error("Failed to execute build check:", err);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

// Register Progressive Web App Service Worker with aggressive update checks
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((reg) => {
        console.log("[PWA] Service Worker registered under scope:", reg.scope);
        
        // Force checking for updates on load
        reg.update().catch((err) => console.warn("SW update failed:", err));

        // If a new worker is found, listen for activation and force updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] New update installed. Reloading...");
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error("[PWA] Service Worker failure standard:", err);
      });
  });

  // Reload the page when the service worker controlling it changes (e.g., skipWaiting or active claim)
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

