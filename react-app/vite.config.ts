import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { API_CACHE_MAX_AGE_SECONDS, API_CACHES, escapeRegExp, STATIC_FILE_PATTERN } from './src/pwa/runtimeCache';

// Unit tests use vitest.config.ts and never load this file.
export default defineConfig({
    plugins: [
        react(),
        // Port of Angular's ngsw-config.json:
        // - "app" group (prefetch: favicon, index.html, *.css, *.js, manifest.webmanifest) → Workbox precache,
        //   plus the app-shell images (header logo, cog) so the shell renders offline after the first visit.
        // - "assets" group (lazy install, prefetch updates) → StaleWhileRevalidate runtime cache for /assets/**
        //   and other same-origin images/fonts.
        // - New: NetworkFirst runtime caching of the HN APIs so visited feeds/items/users work offline.
        VitePWA({
            strategies: 'generateSW',
            registerType: 'autoUpdate',
            // src/pwa/registerSW.ts registers the SW (virtual:pwa-register), called from main.tsx.
            injectRegister: false,
            // public/manifest.webmanifest is the port of Angular's src/manifest.json; index.html links it.
            manifest: false,
            // Never combine includeAssets/manifest icons with globPatterns: duplicate precache URLs make Workbox
            // throw add-to-cache-list-conflicting-entries and the SW silently caches nothing.
            includeManifestIcons: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,webmanifest}', 'assets/images/*.{svg,png}'],
                // Retires the Angular service worker for returning visitors; must never be precached.
                globIgnores: ['ngsw-worker.js'],
                navigateFallback: 'index.html',
                // Firebase reserved URLs and static files must not get the app shell.
                navigateFallbackDenylist: [/^\/__\//, STATIC_FILE_PATTERN],
                cleanupOutdatedCaches: true,
                // autoUpdate only sets these itself with injectRegister 'auto'.
                skipWaiting: true,
                clientsClaim: true,
                runtimeCaching: [
                    ...API_CACHES.map(({ origin, cacheName, maxEntries }) => ({
                        urlPattern: new RegExp(`^${escapeRegExp(origin)}/`),
                        handler: 'NetworkFirst' as const,
                        options: {
                            cacheName,
                            networkTimeoutSeconds: 5,
                            expiration: { maxEntries, maxAgeSeconds: API_CACHE_MAX_AGE_SECONDS },
                            cacheableResponse: { statuses: [200] },
                        },
                    })),
                    {
                        urlPattern: ({ url, sameOrigin }) =>
                            sameOrigin &&
                            (url.pathname.startsWith('/assets/') ||
                                /\.(?:eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/i.test(url.pathname)),
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'assets',
                            expiration: { maxEntries: 60 },
                            cacheableResponse: { statuses: [200] },
                        },
                    },
                ],
            },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                // src/styles/_*.scss is copied verbatim from Angular (@import, `/` division, darken()).
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
            },
        },
    },
    server: { port: 4200, strictPort: true },
    preview: { port: 4173, strictPort: true },
    build: { outDir: 'dist', emptyOutDir: true },
});
