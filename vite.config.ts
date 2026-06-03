/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: false,
            workbox: {
                navigateFallback: '/index.html',
                globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.origin === 'https://node-hnapi.herokuapp.com',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hnapi',
                            expiration: { maxEntries: 200, maxAgeSeconds: 300 },
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
                // `includePaths` for the legacy sass API (Vite default),
                // `loadPaths` for the modern API — provide both so component
                // SCSS can `@import 'media'` / `@import 'theme_variables'`.
                includePaths: [path.resolve(__dirname, 'src/styles/scss')],
                loadPaths: [path.resolve(__dirname, 'src/styles/scss')],
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: true,
    },
});
