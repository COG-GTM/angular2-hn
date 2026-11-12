/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: false,
            includeManifestIcons: false,
            // Mirrors src/manifest.json from the Angular app.
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
                icons: [
                    { src: 'assets/icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
                ],
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
            },
            workbox: {
                // ngsw "app" asset group (installMode: prefetch): favicon, index.html, *.css, *.js, manifest.
                globPatterns: ['**/*.{js,css,html,ico,webmanifest}'],
                globIgnores: ['ngsw-worker.js'],
                // ngsw "index": "/index.html" — serve the app shell for navigations.
                navigateFallback: 'index.html',
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        // ngsw "assets" asset group (installMode: lazy, updateMode: prefetch).
                        urlPattern: ({ sameOrigin, url }) =>
                            sameOrigin &&
                            (url.pathname.startsWith('/assets/') ||
                                /\.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/.test(url.pathname)),
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'assets' },
                    },
                    {
                        // HN API responses: network first, fall back to the last response when offline.
                        // Workbox serializes this callback into sw.js, so it must not reference outer variables.
                        urlPattern: /^https:\/\/(node-hnapi\.herokuapp\.com|api\.hnpwa\.com)\//,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            networkTimeoutSeconds: 5,
                            expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
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
                // The SCSS is reused verbatim from the Angular app (@import, slash division, darken()).
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: false,
    },
});
