import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        // "app" group from ngsw-config.json — prefetch core shell assets
        globPatterns: [
          '**/*.html',
          '**/*.css',
          '**/*.js',
          'manifest.json',
          'favicon.ico',
        ],
        // "assets" group from ngsw-config.json — lazy cache with update
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|gif|svg|ico|eot|otf|ttf|woff|woff2|cur|ani)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hn-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5,
              },
            },
          },
        ],
      },
    }),
  ],
})
