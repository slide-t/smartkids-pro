// ==== SmartKids Learning Service Worker ====

// ⚙️ VERSION — bump this anytime you change files
const CACHE_NAME = "smartkids-cache-v2";
const APP_SHELL = [
  "/",                        // adjust if not at root
  "/index.html",
  "/ict_lessons.html",
  "/ict_detail-notes.html",
  "/mouse.html",
"/keyboard.html",
  "/json-files/ict_lessons.json",
  "/Images/logo.png",
  "/scripts/main.js"
];

// ✅ Install event — cache all core assets
self.addEventListener("install", event => {
  console.log("[SW] Installing new service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting(); // Activate immediately
});

// ✅ Activate event — clear old caches
self.addEventListener("activate", event => {
  console.log("[SW] Activating new service worker...");
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ✅ Fetch event — serve from cache first, fallback to network
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const networkFetch = fetch(event.request)
        .then(response => {
          // Update cache with latest response
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        })
        .catch(() => cachedResponse); // fallback offline

      return cachedResponse || networkFetch;
    })
  );
});

// ✅ Notify clients of updates
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
