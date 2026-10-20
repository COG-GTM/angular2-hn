import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Owned by the PWA/e2e/CI child (Wave 2). Unit tests use vitest.config.ts and never load this file.
export default defineConfig({
    plugins: [
        react(),
        // --- PWA plugin goes here (vite-plugin-pwa `VitePWA({...})`, owned by the PWA child) ---
    ],
    css: {
        preprocessorOptions: {
            scss: {
                // shared/scss is copied verbatim from Angular (@import, `/` division, darken()).
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
            },
        },
    },
    server: { port: 4200, strictPort: true },
    preview: { port: 4173, strictPort: true },
    build: { outDir: 'dist', emptyOutDir: true },
});
