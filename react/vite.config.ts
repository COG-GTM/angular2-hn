import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Stub PWA config; manifest, icons and runtime caching are wired up in Phase 5.
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // The ported Angular stylesheets still use @import and darken().
        silenceDeprecations: ['import', 'color-functions', 'global-builtin'],
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: false,
    }),
  ],
});
