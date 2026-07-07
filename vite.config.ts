import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        'assets/icons/safari-pinned-tab.svg',
        'assets/images/logo.svg',
      ],
      manifest: {
        name: 'Angular 2 HN',
        short_name: 'Angular 2 HN',
        theme_color: '#b92b27',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './?utm_source=web_app_manifest',
        icons: [
          {
            src: 'assets/icons/android-chrome-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: 'assets/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'assets/icons/android-chrome-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'assets/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Precache the app shell (mirrors the "app" assetGroup in ngsw-config.json).
        globPatterns: ['**/*.{js,css,html,ico}'],
        runtimeCaching: [
          {
            // Lazily cache local assets (mirrors the "assets" assetGroup).
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets',
            },
          },
          {
            // Cache Hacker News API responses so previously viewed pages work offline.
            urlPattern: ({ url }) => url.origin === 'https://node-hnapi.herokuapp.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hn-api',
              expiration: {
                maxEntries: 200,
              },
            },
          },
        ],
      },
    }),
  ],
});
