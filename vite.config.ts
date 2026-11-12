/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Service worker mirrors the former ngsw-config.json:
//  - "app" group (prefetch): index.html, JS, CSS, favicon, manifest -> Workbox precache
//  - "assets" group (lazy): /assets/** and static media/fonts -> runtime CacheFirst
// No API data is cached, matching the absence of ngsw dataGroups.
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'script-defer',
            manifest: false,
            includeManifestIcons: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html}', 'favicon.ico', 'manifest.json'],
                navigateFallback: '/index.html',
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: ({ url, sameOrigin }) =>
                            sameOrigin &&
                            (url.pathname.startsWith('/assets/') ||
                                /\.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/.test(url.pathname)),
                        handler: 'CacheFirst',
                        options: { cacheName: 'assets' },
                    },
                ],
            },
        }),
    ],
    build: {
        outDir: 'dist',
        assetsDir: 'static',
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
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: false,
    },
});
