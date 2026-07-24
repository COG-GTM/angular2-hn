import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
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
                ],
            },
        }),
    ],
});
