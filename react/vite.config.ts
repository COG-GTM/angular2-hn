/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: false,
            includeAssets: ['favicon.ico', 'manifest.json'],
            workbox: {
                // App shell (ngsw "app" asset group, installMode prefetch):
                // index.html, JS, CSS and the favicon are precached at install time.
                globPatterns: ['**/*.{js,css,html}', 'favicon.ico', 'manifest.json'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        // Lazy assets (ngsw "assets" group, installMode lazy):
                        // images, icons and fonts are cached on first use.
                        urlPattern: /\.(?:eot|svg|cur|jpg|jpeg|png|webp|gif|otf|ttf|woff|woff2|ani|ico)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'assets',
                            expiration: { maxEntries: 100 },
                        },
                    },
                ],
            },
        }),
    ],
    test: {
        environment: 'jsdom',
        globals: true,
    },
});
