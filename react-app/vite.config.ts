/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// PWA config replicates src/manifest.json + ngsw-config.json from the Angular app,
// plus runtime caching of HN API responses for offline reading.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // public/ is already covered by globPatterns; listing it again (or the manifest icons) creates
      // duplicate precache entries and the service worker install fails.
      includeManifestIcons: false,
      manifest: {
        name: 'React HN',
        short_name: 'React HN',
        description: 'A Hacker News client built with React, TypeScript and Vite',
        icons: [144, 192, 256, 512].map((size) => ({
          src: `/assets/icons/android-chrome-${size}x${size}.png`,
          sizes: `${size}x${size}`,
          type: 'image/png',
        })),
        theme_color: '#b92b27',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/?utm_source=web_app_manifest',
        scope: '/',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,xml}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(node-hnapi\.herokuapp\.com|api\.hnpwa\.com)\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hn-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: { port: 5173 },
  preview: { port: 4173 },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div'],
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
