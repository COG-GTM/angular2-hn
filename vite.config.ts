/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 4200,
    },
    build: {
        outDir: 'dist',
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                // The ported Angular stylesheets still use the legacy @import / slash-division syntax.
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
        css: false,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/*.test.{ts,tsx}', 'src/setupTests.ts', 'src/testUtils.tsx', 'src/main.tsx'],
        },
    },
});
