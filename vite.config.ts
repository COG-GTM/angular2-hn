/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'assets/**/*'],
      manifest: {
        name: 'React HN',
        short_name: 'React HN',
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
        // App shell precache (mirrors ngsw-config "app" prefetch group)
        globPatterns: ['**/*.{js,css,html,ico}'],
        // Lazy runtime caching of assets (mirrors ngsw-config "assets" lazy group)
        runtimeCaching: [
          {
            urlPattern: /\/assets\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets',
              expiration: { maxEntries: 100 },
            },
          },
          {
            urlPattern: /\.(?:eot|svg|cur|jpg|jpeg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 100 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
