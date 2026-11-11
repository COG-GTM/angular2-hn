import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    strategies: 'generateSW',
    manifest: false,
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    filename: 'sw.js',
    workbox: {
      globPatterns: ['**/*.{html,js,css}', 'favicon.ico', 'manifest.json', 'assets/**/*'],
      dontCacheBustURLsMatching: /-[\w-]{8}\.(?:js|css)$/,
      navigateFallback: '/index.html',
    },
  })],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', restoreMocks: true },
});
