import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            // index.html already links the hand-written public/manifest.json.
            manifest: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.pathname.startsWith('/assets/'),
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'assets' },
                    },
                    {
                        urlPattern: ({ url }) => url.origin === 'https://node-hnapi.herokuapp.com',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            networkTimeoutSeconds: 10,
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        port: 4200,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        css: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/main.tsx',
                'src/**/*.test.{ts,tsx}',
                'src/test/**',
                // Type-only modules compile away to nothing and cannot be covered.
                'src/models/{comment,pollResult,story,user,settings,index}.ts',
            ],
            thresholds: {
                lines: 80,
                statements: 80,
                functions: 80,
                branches: 80,
            },
        },
    },
});
