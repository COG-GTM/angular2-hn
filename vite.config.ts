import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    build: {
        outDir: 'dist-react',
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: ['favicon.ico', 'assets/**/*'],
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
                icons: [
                    { src: 'assets/icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
                ],
            },
            workbox: {
                // App shell: prefetched at install time, mirroring the "app" asset group of ngsw-config.json.
                globPatterns: ['**/*.{js,css,html,ico,webmanifest}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        // Mirrors the lazy "assets" group of ngsw-config.json.
                        urlPattern: /\/assets\/.*\.(?:eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'assets',
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*$/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            networkTimeoutSeconds: 10,
                            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
        }),
    ],
});
