
const CACHE_NAME = 'faithflow-v2';

// Activate the new service worker immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// Temporarily load files directly from the network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(fetch(event.request));
});
