/** API origins the service worker caches at runtime (NetworkFirst). Shared with vite.config.ts. */
export const API_CACHES = [
    { origin: 'https://node-hnapi.herokuapp.com', cacheName: 'hn-api', maxEntries: 200 },
    { origin: 'https://api.hnpwa.com', cacheName: 'hnpwa-api', maxEntries: 100 },
] as const;

export const API_CACHE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** Static files that must never get the SPA index.html fallback (deep links like `/user/a.b` still do). */
export const STATIC_FILE_EXTENSIONS = [
    'js',
    'mjs',
    'css',
    'map',
    'json',
    'webmanifest',
    'txt',
    'xml',
    'ico',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'svg',
    'webp',
    'avif',
    'woff',
    'woff2',
    'ttf',
    'otf',
    'eot',
    'cur',
    'ani',
] as const;

/** First path segments of client routes (src/app/routes.tsx); their params may contain dots, e.g. `/user/john.json`. */
export const APP_ROUTE_PREFIXES = ['news', 'newest', 'show', 'ask', 'jobs', 'item', 'user'] as const;

/** Workbox tests navigateFallbackDenylist against `pathname + search`. */
export const STATIC_FILE_PATTERN = new RegExp(
    `^(?!/(?:${APP_ROUTE_PREFIXES.join('|')})/)[^?]*\\.(?:${STATIC_FILE_EXTENSIONS.join('|')})(?:\\?.*)?$`,
    'i'
);

export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isRuntimeCachedUrl(url: string): boolean {
    return API_CACHES.some(({ origin }) => url.startsWith(`${origin}/`));
}
