import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: false,
            includeAssets: ['favicon.ico', 'manifest.json', 'assets/**/*'],
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
                navigateFallback: 'index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*$/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 },
                        },
                    },
                ],
            },
            devOptions: { enabled: false },
        }),
    ],
    build: {
        outDir: 'dist/angular-hnpwa',
    },
    server: {
        port: 4200,
    },
    test: {
        environment: 'jsdom',
        globals: true,
    },
});
