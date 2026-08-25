import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifestFilename: 'manifest.json',
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
                icons: [
                    {
                        src: '/assets/icons/android-chrome-144x144.png',
                        sizes: '144x144',
                        type: 'image/png',
                    },
                    {
                        src: '/assets/icons/android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/assets/icons/android-chrome-256x256.png',
                        sizes: '256x256',
                        type: 'image/png',
                    },
                    {
                        src: '/assets/icons/android-chrome-512x512.png',
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
                globPatterns: ['**/*.{js,css,html,ico}'],
                runtimeCaching: [
                    {
                        urlPattern: /\/assets\/.*/i,
                        handler: 'CacheFirst',
                        options: { cacheName: 'assets' },
                    },
                    {
                        urlPattern: /\.(?:eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff2?)$/i,
                        handler: 'CacheFirst',
                        options: { cacheName: 'images' },
                    },
                ],
            },
        }),
    ],
});
