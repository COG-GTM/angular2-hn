import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'React HN',
        short_name: 'React HN',
        theme_color: '#b92b27',
        icons: [
          { src: '/assets/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
          { src: '/assets/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
          { src: '/assets/icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/icons/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: '/assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/assets/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
        background_color: '#b92b27',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
});
