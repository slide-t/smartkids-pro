// ==== SmartKids-Pro Service Worker ====

// ⚙️ Increment this version any time you update assets
const CACHE_NAME = "smartkids-cache-v3";
const APP_SHELL = [
  "/",
  "/index.html",
  "/ict_lessons.html",
  "/ict_detail-notes.html",
  "/json-files/ict_lessons.json",
  "/mouse.html",
  "/keyboard.html",
  "/images/logo.png"
];

// ✅ INSTALL — cache all static files
self.addEventListener("install", event => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting(); // activate immediately
});

// ✅ ACTIVATE — clear old caches
self.addEventListener("activate", event => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log("[SW] Deleting old cache:", k);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

// ✅ FETCH — use cache, then network fallback
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, networkResponse.clone())
            );
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);
      return cachedResponse || fetchPromise;
    })
  );
});

// ✅ MESSAGE — used for forcing update (skip waiting)
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
