// Replaces the Angular service worker (ngsw-worker.js) that the old app registered, following Angular's
// safety-worker.js: browsers fetch it on their next update check, and it takes control without a fetch
// handler, clears the Angular caches and unregisters, so the next load gets the React app and /sw.js.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients
      .claim()
      .then(() => caches.keys())
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('ngsw:')).map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
  );
});
