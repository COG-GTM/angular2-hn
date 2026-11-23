// Replaces the Angular service worker (ngsw-worker.js) that the old app registered. Browsers fetch this on
// their next update check; it unregisters right away, so the next navigation loads the React app and
// registers /sw.js. Angular tabs that are still open keep this worker until they reload: it serves their
// lazy chunks from ngsw's caches, because the React deployment no longer has them. Those caches are kept,
// since another tab may still be running Angular.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim().then(() => self.registration.unregister()));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.mode === 'navigate' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
});
