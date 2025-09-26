import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'React HN',
        short_name: 'React HN',
        description: 'Hacker News PWA built with React',
        theme_color: '#b92b27',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './?utm_source=web_app_manifest',
        icons: [
          {
            src: 'assets/icons/android-chrome-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'assets/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/icons/android-chrome-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'assets/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 4200,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
