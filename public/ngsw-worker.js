// Safety worker for returning visitors who still have the old Angular app's service worker (ngsw) installed
// at /ngsw-worker.js. The browser fetches this script on its next update check: it replaces the Angular
// worker, deletes the `ngsw:*` caches, unregisters itself and reloads open tabs so they load the React app,
// which then registers its own /sw.js. Served with no-cache headers (firebase.json), excluded from precache.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.filter((key) => key.startsWith('ngsw:')).map((key) => caches.delete(key)));
            await self.registration.unregister();
            const windows = await self.clients.matchAll({ type: 'window' });
            await Promise.all(windows.map((client) => client.navigate(client.url)));
        })()
    );
});
