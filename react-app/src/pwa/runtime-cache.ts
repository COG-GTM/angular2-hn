// API origins the service worker caches at runtime (NetworkFirst). Shared with vite.config.ts.
export const API_CACHES = [
    { origin: 'https://node-hnapi.herokuapp.com', cacheName: 'hn-api', maxEntries: 200 },
    { origin: 'https://api.hnpwa.com', cacheName: 'hnpwa-api', maxEntries: 100 },
] as const;

export function isRuntimeCachedUrl(url: string) {
    return API_CACHES.some(({ origin }) => url.startsWith(`${origin}/`));
}
