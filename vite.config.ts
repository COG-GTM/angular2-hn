/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// React scaffold coexisting with the Angular 9 app.
// Vite uses the root-level index.html as its entry (Angular keeps src/index.html).
export default defineConfig({
    plugins: [
        react(),
        // PWA support (Workbox) mirroring the Angular @angular/service-worker behavior.
        // Manifest values are ported verbatim from src/manifest.json; the app-shell
        // precache mirrors the ngsw-config.json "app" asset group.
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: [
                'favicon.ico',
                'assets/icons/apple-touch-icon.png',
                'assets/icons/safari-pinned-tab.svg',
            ],
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
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
            },
            workbox: {
                // Precache the built app shell + static assets (mirrors ngsw "app"/"assets" groups).
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
                navigateFallback: 'index.html',
                runtimeCaching: [
                    {
                        urlPattern: ({ request }) => request.mode === 'navigate',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'app-shell',
                            expiration: {
                                maxEntries: 32,
                            },
                        },
                    },
                ],
            },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {},
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        passWithNoTests: true,
    },
});
