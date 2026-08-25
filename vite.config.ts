import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: null,
            devOptions: {
                enabled: false,
            },
            manifest: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico}', 'manifest.json'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        urlPattern: /\/assets\/.*/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'angular2-hn-assets',
                        },
                    },
                ],
            },
        }),
    ],
    publicDir: 'public',
    build: {
        outDir: 'dist/react',
        emptyOutDir: true,
    },
    server: {
        port: 3000,
    },
});
