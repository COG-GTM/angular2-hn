import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'assets/icons/*.png', 'assets/images/*.svg', 'assets/images/*.png'],
      manifest: {
        name: 'Angular 2 HN',
        short_name: 'Angular2 HN',
        description: 'A progressive Hacker News client',
        theme_color: '#b92b27',
        background_color: '#b92b27',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/hacker-news\.firebaseio\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hn-api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
});
