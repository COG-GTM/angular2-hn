// Kill switch for the legacy Angular service worker (@angular/service-worker).
// Browsers that installed the Angular PWA keep polling /ngsw-worker.js; this replacement
// unregisters it and reloads open tabs so they pick up the React app and its Workbox worker.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.filter((key) => key.startsWith('ngsw:')).map((key) => caches.delete(key)));
            await self.registration.unregister();
            const clients = await self.clients.matchAll({ type: 'window' });
            clients.forEach((client) => client.navigate(client.url));
        })()
    );
});
