const CACHE_NAME = "livingstoneedu-cache-3c2551060be0cb3c3314700b434ab429a9075a8d";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/logo.jpg",
  "/manifest.json"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching Core App Shell");
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("[Service Worker] Caching assets list had warnings (e.g. dev environment routes):", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Discarding stale cache version:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Dynamic Network First strategy with Offline Cache fallback
self.addEventListener("fetch", (event) => {
  // Only capture standard page resource requests, bypass background APIs, FCMs, and POSTs
  const isGet = event.request.method === "GET";
  const isApi = event.request.url.includes("/api/") || event.request.url.includes("firestore.googleapis.com") || event.request.url.includes("firebase");
  
  if (!isGet || isApi) {
    return;
  }

  // Handle SPA client-side routes navigation safely
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html").then((cachedResponse) => {
        // Return cached index.html immediately for instant offline loading of any SPA route
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback to fetch from root in case index.html isn't fully cached
        return fetch("/");
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache valid page resources dynamically for offline reading compatibility
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // User is offline - resolve with matching cached entries
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
        });
      })
  );
});
