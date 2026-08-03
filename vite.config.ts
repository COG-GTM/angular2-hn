import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico'],
            manifestFilename: 'manifest.webmanifest',
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
                description: 'A progressive Hacker News client',
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
                icons: [
                    { src: 'assets/icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
                ],
            },
            workbox: {
                // App shell: precache the built html/js/css and the manifest, as the `app` asset group did
                globPatterns: ['**/*.{html,js,css,ico,webmanifest}'],
                navigateFallback: '/index.html',
                // Static assets: cache on first use and keep them, as the lazy `assets` group did
                runtimeCaching: [
                    {
                        urlPattern: /\/assets\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico|cur|eot|otf|ttf|woff2?|ani|xml)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'assets',
                            expiration: { maxEntries: 60 },
                        },
                    },
                ],
            },
        }),
    ],
    build: {
        outDir: 'dist',
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: false,
        include: ['src/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
        },
    },
});
