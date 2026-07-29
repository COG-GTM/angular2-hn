import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: false,
            includeAssets: ['favicon.ico', 'manifest.json', 'assets/**/*'],
            workbox: {
                globPatterns: ['**/*.{js,css,html}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*$/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            networkTimeoutSeconds: 10,
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /\/assets\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico|xml|webmanifest)$/,
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'assets' },
                    },
                ],
            },
            devOptions: { enabled: false },
        }),
    ],
});
