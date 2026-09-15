import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: false,
            includeAssets: ['favicon.ico', 'assets/**/*'],
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,json}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 3600,
                            },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        port: 4200,
    },
});
