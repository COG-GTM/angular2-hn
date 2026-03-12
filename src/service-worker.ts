/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache static assets
precacheAndRoute(
    (self as unknown as { __WB_MANIFEST: Array<{ url: string; revision: string | null }> }).__WB_MANIFEST || []
);

// Cache-first for static assets (app shell: HTML, JS, CSS, icons)
registerRoute(
    ({ request }) =>
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.destination === 'font',
    new CacheFirst({
        cacheName: 'static-assets',
    })
);

// Network-first with cache fallback for API requests
registerRoute(
    ({ url }) => url.href.startsWith('https://node-hnapi.herokuapp.com'),
    new NetworkFirst({
        cacheName: 'api-cache',
    })
);

// Listen for messages from clients
self.addEventListener('message', (event: ExtendableMessageEvent) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
