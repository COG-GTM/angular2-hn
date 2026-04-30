import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'assets/**/*'],
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'HN',
                description: 'A Hacker News client built with React',
                theme_color: '#b92b27',
                background_color: '#b92b27',
                display: 'standalone',
                start_url: '/',
                icons: [
                    { src: '/assets/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
                    { src: '/assets/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
                    { src: '/assets/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,gif,woff,woff2}'],
            },
        }),
    ],
});
