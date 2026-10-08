/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// PWA (vite-plugin-pwa) is configured by the PWA/build/deploy workstream.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 4200,
    },
    preview: {
        port: 4200,
    },
    css: {
        preprocessorOptions: {
            scss: {
                // The ported Angular SCSS still uses @import.
                silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: false,
    },
});
