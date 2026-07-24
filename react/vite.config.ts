/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    test: {
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
    css: {
        preprocessorOptions: {
            scss: {
                // Legacy SCSS ported from the Angular app still uses @import and slash division
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
            },
        },
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: false,
            includeAssets: ['favicon.ico', 'manifest.json'],
            workbox: {
                // App shell (mirrors the old ngsw-config "app" prefetch group)
                globPatterns: ['**/*.{js,css,html,ico}', 'manifest.json'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        // Lazy-cached static assets (mirrors the old ngsw-config "assets" group)
                        urlPattern: /\/assets\/.*\.(?:eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'assets',
                            expiration: { maxEntries: 100 },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/hn\.algolia\.com\/api\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-algolia-api',
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
                        },
                    },
                ],
            },
        }),
    ],
});
