/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'React HN',
        short_name: 'React HN',
        icons: [
          { src: 'assets/icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: 'assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'assets/icons/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: '#b92b27',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './?utm_source=web_app_manifest',
      },
      workbox: {
        // App shell (equivalent of the "app" asset group in ngsw-config.json, installMode prefetch)
        globPatterns: ['**/*.{js,css,html,ico,webmanifest}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          // Lazy-cached static assets (equivalent of the "assets" asset group, installMode lazy)
          {
            urlPattern: /\.(?:eot|svg|cur|jpg|jpeg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets',
              expiration: { maxEntries: 100 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
