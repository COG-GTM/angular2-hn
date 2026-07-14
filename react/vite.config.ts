import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// PWA/manifest wiring is intentionally minimal here; detailed service-worker
// runtime config and manifest integration are finalized in a later task.
// For now we keep the existing public/manifest.json as the source of truth
// and disable plugin-generated manifest injection so the static head stays intact.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: null,
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html}'],
      },
    }),
  ],
  build: {
    outDir: 'dist',
  },
});
