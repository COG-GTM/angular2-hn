import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: ['favicon.ico', 'assets/**/*'],
            manifest: {
                name: 'React HN',
                short_name: 'React HN',
                icons: [144, 192, 256, 512].map((size) => ({
                    src: `assets/icons/android-chrome-${size}x${size}.png`,
                    sizes: `${size}x${size}`,
                    type: 'image/png',
                })),
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,xml,webmanifest}'],
                navigateFallback: 'index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*$/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            networkTimeoutSeconds: 5,
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
        sourcemap: true,
    },
});
