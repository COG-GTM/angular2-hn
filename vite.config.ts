/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const DEFAULT_API_BASE_URL = 'https://node-hnapi.herokuapp.com';

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    const apiBaseUrl = (env.VITE_HN_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

    return {
        plugins: [
            react(),
            VitePWA({
                // Port of ngsw-config.json: the Angular service worker prefetched the app shell
                // (index.html, *.js, *.css, favicon, manifest) and lazily cached /assets/** and
                // font/image files. Workbox precaches the shell (including the lazy route chunks)
                // and the runtime rules below cover the API and static assets.
                registerType: 'autoUpdate',
                injectRegister: null, // registration lives in src/pwa.ts
                // The manifest is a static file (public/manifest.webmanifest) linked from index.html so
                // that it is also available in `vite dev`, where the plugin is disabled.
                manifest: false,
                devOptions: { enabled: false },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,svg,png,webmanifest,json}'],
                    navigateFallback: '/index.html',
                    // Firebase Hosting reserved namespace (/__/*) and non-HTML files must not fall back to the shell.
                    navigateFallbackDenylist: [/^\/__/, /\/[^/?]+\.[^/]+$/],
                    cleanupOutdatedCaches: true,
                    clientsClaim: true,
                    skipWaiting: true,
                    runtimeCaching: [
                        {
                            // Hacker News API: NetworkFirst so an online user always sees fresh stories,
                            // while the last successful response is served when offline or when the
                            // API is slow (> 5s). The max-age only bounds how long that offline fallback
                            // stays usable (Workbox drops expired entries even when offline), so it is a
                            // day rather than minutes. `/+` tolerates a trailing slash in the base URL.
                            urlPattern: new RegExp(`^${escapeRegExp(apiBaseUrl)}/+`),
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'hn-api',
                                networkTimeoutSeconds: 5,
                                expiration: { maxEntries: 60, maxAgeSeconds: 24 * 60 * 60 },
                                cacheableResponse: { statuses: [0, 200] },
                            },
                        },
                        {
                            // Images, icons and fonts (ngsw "assets" lazy group: /assets/** and
                            // /*.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)). A RegExp
                            // that does not start with the origin only matches same-origin URLs.
                            urlPattern: /\.(?:eot|svg|cur|jpe?g|png|webp|gif|otf|ttf|woff2?|ani|xml)(?:\?.*)?$/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'hn-static-assets',
                                expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
                                cacheableResponse: { statuses: [0, 200] },
                            },
                        },
                    ],
                },
            }),
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    // The theme SCSS is ported verbatim from the Angular app and still uses
                    // @import, slash division and darken(); silence those deprecations.
                    silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
                },
            },
        },
        build: {
            outDir: 'dist',
            sourcemap: true,
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./src/test-setup.ts'],
            css: false,
        },
    };
});
