import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // Mirrors ngsw-config.json: app shell prefetched, /assets cached lazily, API not cached.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Angular 2 HN',
        short_name: 'Angular 2 HN',
        icons: [144, 192, 256, 512].map((size) => ({
          src: `assets/icons/android-chrome-${size}x${size}.png`,
          sizes: `${size}x${size}`,
          type: 'image/png',
        })),
        theme_color: '#b92b27',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './?utm_source=web_app_manifest',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,webmanifest}', 'favicon.ico'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ sameOrigin, url }) => sameOrigin && url.pathname.startsWith('/assets/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'assets' },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
