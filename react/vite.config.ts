import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        // Mirrors the Angular ServiceWorkerModule, which was registered only when `environment.production`.
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            disable: process.env.NODE_ENV !== 'production',
            // The app shell and its assets are copied verbatim from the Angular `ngsw-config.json` asset groups.
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,svg,png,webp,gif,eot,cur,jpg,otf,ttf,woff,woff2,ani,xml,webmanifest}'],
                navigateFallback: 'index.html',
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
                ],
            },
            manifest: {
                name: 'React HN',
                short_name: 'React HN',
                icons: [
                    { src: 'assets/icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
                ],
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
            },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                // The ported Angular stylesheets still rely on @import; keep the build output quiet.
                silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
            },
        },
    },
    server: {
        port: 4200,
    },
});
