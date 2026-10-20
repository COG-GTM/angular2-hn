import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Owned by Phase 3 (PWA plugin, chunking). Tests use vitest.config.ts, not this file.
export default defineConfig({
    plugins: [react()],
    css: {
        preprocessorOptions: {
            scss: {
                // The shared SCSS is copied verbatim from Angular (@import, `/` division, darken()).
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
            },
        },
    },
    server: { port: 4200 },
    preview: { port: 4173 },
    build: { outDir: 'dist', emptyOutDir: true },
});
