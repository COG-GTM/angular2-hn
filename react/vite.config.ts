/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        // Mirrors ngsw-config.json: the app shell (index.html, JS, CSS, favicon, manifest) is precached
        // ("app" group, installMode prefetch); /assets/** is cached on first use and refreshed in the
        // background ("assets" group, installMode lazy / updateMode prefetch). API responses are not cached.
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'script-defer',
            manifestFilename: 'manifest.webmanifest',
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
                globPatterns: ['index.html', 'favicon.ico', '**/*.{js,css}'],
                navigateFallback: '/index.html',
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: ({ sameOrigin, url }) =>
                            sameOrigin &&
                            (url.pathname.startsWith('/assets/') ||
                                /\.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff2?|ani)$/.test(url.pathname)),
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'assets' },
                    },
                ],
            },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: { api: 'modern-compiler' },
        },
    },
    server: {
        port: 5173,
        strictPort: true,
    },
    preview: {
        port: 4173,
        strictPort: true,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        css: true,
        restoreMocks: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov', 'json-summary'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/main.tsx',
                'src/setupTests.ts',
                'src/**/*.d.ts',
                'src/**/*.{test,spec}.{ts,tsx}',
                'src/test/**',
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80,
            },
        },
    },
});
