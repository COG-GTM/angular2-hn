// Migration worker: replaces the retired Angular service worker on clients that
// still have `/ngsw-worker.js` registered. It clears the Angular caches, gives up
// the root scope and reloads its clients so they can register `sw.js`.
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
            await self.registration.unregister();

            const clients = await self.clients.matchAll({ type: 'window' });
            for (const client of clients) {
                client.navigate(client.url);
            }
        })()
    );
});
