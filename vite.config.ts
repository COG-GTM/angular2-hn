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
      // The app ships a static manifest at public/manifest.json (linked from
      // index.html) which is the single source of truth. Disable the plugin's
      // own manifest generation so only one <link rel="manifest"> is emitted.
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hnapi-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
  },
});
