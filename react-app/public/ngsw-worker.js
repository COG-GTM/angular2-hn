// Safety worker for visitors who still have the Angular app's @angular/service-worker installed.
// The browser fetches this script on its next update check; it replaces the old worker, clears the
// Angular caches, unregisters itself and reloads open tabs so they pick up the React app and its SW.
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
