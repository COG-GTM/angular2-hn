/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // Replaces Angular's ngsw: precache the app shell, cache assets on use, and keep HN API
    // responses so visited pages work offline (what the offline error message promises).
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{html,js,css,ico}'],
        globIgnores: ['ngsw-worker.js', 'service-worker.js'],
        skipWaiting: true,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(icons|images)\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'assets' },
          },
          {
            urlPattern: /^https:\/\/(node-hnapi\.herokuapp\.com|api\.hnpwa\.com)\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hn-api',
              networkTimeoutSeconds: 5,
              // node-hnapi answers a missing item with 200 `{"error": …}` and HNPWA a missing user with 200
              // `null`; don't let those replace a good cached copy.
              plugins: [
                {
                  cacheWillUpdate: async ({ response }) => {
                    if (response.status !== 200) return null;
                    const body = (await response.clone().text()).trimStart();
                    return body === 'null' || body.startsWith('{"error"') ? null : response;
                  },
                },
              ],
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'slash-div', 'color-functions', 'global-builtin', 'legacy-js-api'],
      },
    },
  },
  server: { port: 4200 },
  preview: { port: 4300 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
