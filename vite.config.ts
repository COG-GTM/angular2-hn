/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: null,
            includeAssets: ['favicon.ico', 'assets/icons/**/*', 'assets/images/**/*'],
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
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
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\//,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: false,
            },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import'],
            },
        },
    },
    server: {
        port: 4200,
    },
    preview: {
        port: 4200,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: false,
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
});
