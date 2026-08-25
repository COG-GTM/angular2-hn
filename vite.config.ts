import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
    plugins: [
        react(),
        VitePWA({
            // Angular only registered ngsw-worker.js in production; keep the dev server plain.
            disable: command !== 'build',
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'assets/icons/*', 'assets/images/*'],
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
                icons: [144, 192, 256, 512].map((size) => ({
                    src: `assets/icons/android-chrome-${size}x${size}.png`,
                    sizes: `${size}x${size}`,
                    type: 'image/png',
                })),
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,gif,webmanifest}'],
                navigateFallback: 'index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*$/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            networkTimeoutSeconds: 10,
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                            cacheableResponse: { statuses: [200] },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        port: 4200,
    },
    build: {
        outDir: 'dist',
    },
}));
