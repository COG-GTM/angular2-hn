import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: false,
            workbox: {
                globPatterns: ['**/*.{html,js,css,eot,svg,cur,jpg,png,webp,gif,otf,ttf,woff,woff2,ani}'],
                navigateFallback: '/index.html',
            },
        }),
    ],
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
});
