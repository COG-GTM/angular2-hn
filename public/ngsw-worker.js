// Retires the Angular service worker (ngsw) that earlier versions of this app
// registered, so existing installs pick up the React app and its Workbox
// worker (sw.js). Mirrors Angular's safety-worker.js.
self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.filter((key) => key.startsWith('ngsw:')).map((key) => caches.delete(key)));
            await self.registration.unregister();
            const clients = await self.clients.matchAll({ type: 'window' });
            clients.forEach((client) => client.navigate(client.url));
        })(),
    );
});
