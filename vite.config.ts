import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // Replaces Angular's ServiceWorkerModule.register('ngsw-worker.js').
    // Enabled only for production builds (devOptions.enabled = false).
    // Caching intent ported from ngsw-config.json: precache the app shell
    // (assetGroup "app") and lazily cache images/fonts (assetGroup "assets"),
    // plus a NetworkFirst cache for the HackerNews API.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Keep the existing hand-written public/manifest.json + its <link> tag.
      manifest: false,
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: [
          '**/*.{js,css,html,ico,svg,png,webp,woff,woff2,ttf,eot,json}',
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.origin === 'https://node-hnapi.herokuapp.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hn-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }: { request: Request }) =>
              request.destination === 'image' ||
              request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  publicDir: 'public',
  build: {
    outDir: 'dist/react',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
