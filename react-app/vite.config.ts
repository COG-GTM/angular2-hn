import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Original Angular SCSS uses legacy `/` division, @import and global
        // color functions; silence the Dart Sass deprecation noise to keep a
        // 1:1 port without rewriting the stylesheets.
        silenceDeprecations: ['slash-div', 'import', 'global-builtin', 'color-functions'],
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'assets/icons/safari-pinned-tab.svg',
        'assets/icons/apple-touch-icon.png',
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
          { src: 'assets/icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: 'assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'assets/icons/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.href.startsWith('https://node-hnapi.herokuapp.com'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hnapi-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
