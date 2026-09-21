import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico'],
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
                globPatterns: ['**/*.{js,css,html,ico}'],
                navigateFallback: 'index.html',
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.pathname.startsWith('/assets/'),
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'assets' },
                    },
                ],
            },
        }),
    ],
    build: {
        outDir: 'dist/react-hnpwa',
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
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.d.ts', 'src/**/*.{test,spec}.{ts,tsx}'],
            thresholds: {
                lines: 80,
                branches: 80,
                functions: 80,
                statements: 80,
            },
        },
    },
});
