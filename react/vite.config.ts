/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'assets/**/*'],
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
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
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
                navigateFallback: '/index.html',
            },
        }),
    ],
    build: {
        sourcemap: true,
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/test/**', 'src/main.tsx', 'src/**/*.d.ts'],
        },
    },
});
