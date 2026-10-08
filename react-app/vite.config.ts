/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const API_CACHE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            strategies: 'generateSW',
            registerType: 'autoUpdate',
            // src/pwa registers the SW itself (virtual:pwa-register).
            injectRegister: false,
            // Never combine includeAssets with globPatterns: duplicate precache URLs make Workbox
            // throw add-to-cache-list-conflicting-entries and the SW caches nothing.
            includeManifestIcons: false,
            // Same fields as the Angular app's src/manifest.json.
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
                icons: [144, 192, 256, 512].map((size) => ({
                    src: `assets/icons/android-chrome-${size}x${size}.png`,
                    sizes: `${size}x${size}`,
                    type: 'image/png',
                })),
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
            },
            workbox: {
                // App shell: JS/CSS/HTML/icons/svg. manifest.webmanifest is added by the plugin.
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                navigateFallback: 'index.html',
                // Firebase reserved URLs and file requests must not get the app shell.
                navigateFallbackDenylist: [/^\/__\//, /\/[^/?]+\.[^/]+$/],
                cleanupOutdatedCaches: true,
                // autoUpdate only sets these itself when injectRegister is 'auto'.
                skipWaiting: true,
                clientsClaim: true,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            networkTimeoutSeconds: 5,
                            expiration: { maxEntries: 200, maxAgeSeconds: API_CACHE_MAX_AGE_SECONDS },
                            cacheableResponse: { statuses: [200] },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/api\.hnpwa\.com\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hnpwa-api',
                            networkTimeoutSeconds: 5,
                            expiration: { maxEntries: 100, maxAgeSeconds: API_CACHE_MAX_AGE_SECONDS },
                            cacheableResponse: { statuses: [200] },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        port: 4200,
    },
    preview: {
        port: 4200,
    },
    css: {
        preprocessorOptions: {
            scss: {
                // The ported Angular SCSS still uses @import.
                silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
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
