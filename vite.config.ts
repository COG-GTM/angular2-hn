import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    server: {
        port: 4200,
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            },
        },
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'assets/icons/**', 'assets/images/**'],
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
                icons: [
                    {
                        src: 'assets/icons/android-chrome-144x144.png',
                        sizes: '144x144',
                        type: 'image/png',
                    },
                    {
                        src: 'assets/icons/android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'assets/icons/android-chrome-256x256.png',
                        sizes: '256x256',
                        type: 'image/png',
                    },
                    {
                        src: 'assets/icons/android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
            },
            workbox: {
                navigateFallback: '/index.html',
                globPatterns: ['**/*.{js,css,html,ico,png,svg,xml,jpg,gif,webp,cur,ani,eot,otf,ttf,woff,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24,
                            },
                        },
                    },
                ],
            },
        }),
    ],
});
