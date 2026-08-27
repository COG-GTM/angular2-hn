import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeAssets: ['assets/**', 'favicon.ico'],
      manifest: {
        name: 'Angular 2 HN React',
        short_name: 'Angular 2 HN',
        description: 'A Hacker News client built with React, TypeScript and Vite',
        theme_color: '#b92b27',
        background_color: '#f5f5f5',
        display: 'standalone',
        start_url: '/news/1',
        icons: [
          { src: 'assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  build: { target: 'es2020' }
});
