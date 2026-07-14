import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
  },
  server: {
    port: 4200,
  },
  preview: {
    port: 4200,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'assets/icons/**/*',
        'assets/images/**/*',
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
        // Precache the app shell for offline support (parity with ngsw prefetch).
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
});
