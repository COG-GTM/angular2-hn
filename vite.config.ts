import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';
import { pwaOptions } from './src/pwa/pwaOptions';

export default defineConfig({
    plugins: [react(), VitePWA(pwaOptions)],
    css: {
        preprocessorOptions: {
            scss: { api: 'modern' },
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    test: {
        environment: 'jsdom',
        globals: false,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: false,
    },
});
