import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'assets/**/*'],
            // Reuse the existing public/manifest.json (linked in index.html) verbatim.
            manifest: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                navigateFallback: 'index.html',
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.origin === 'https://node-hnapi.herokuapp.com',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hnapi-cache',
                            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
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
                api: 'modern-compiler',
                silenceDeprecations: ['legacy-js-api', 'import', 'slash-div', 'color-functions', 'global-builtin'],
            },
        },
    },
    server: {
        port: 4200,
    },
    preview: {
        port: 4200,
    },
});
