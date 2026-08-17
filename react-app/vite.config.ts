/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import'],
            },
        },
    },
    server: {
        port: 4200,
    },
    preview: {
        port: 4200,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: false,
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
});
