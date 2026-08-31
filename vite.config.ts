import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            injectRegister: null,
            registerType: 'autoUpdate',
            manifest: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,xml,json}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
                        },
                    },
                ],
            },
        }),
    ],
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
    server: {
        port: 4200,
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/setupTests.ts',
        css: false,
    },
});
