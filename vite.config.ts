/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist/react-hnpwa',
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
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/app/**',
                'src/environments/**',
                'src/main.ts',
                'src/polyfills.ts',
                'src/test.ts',
                'src/main.tsx',
                'src/test/**',
                'src/**/*.d.ts',
                'src/**/*.{test,spec}.{ts,tsx}',
            ],
            thresholds: {
                lines: 80,
                branches: 80,
                functions: 80,
                statements: 80,
            },
        },
    },
});
