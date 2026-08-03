/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: false,
            includeAssets: ['favicon.ico', 'manifest.json', 'assets/**/*'],
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico,xml}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*$/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                        },
                    },
                ],
            },
            devOptions: { enabled: false },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
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
        setupFiles: ['./src/setupTests.ts'],
        css: false,
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/setupTests.ts', 'src/main.tsx', 'src/vite-env.d.ts'],
            thresholds: {
                statements: 90,
                branches: 85,
                functions: 90,
                lines: 90,
            },
        },
    },
});
