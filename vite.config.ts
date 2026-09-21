import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 4200,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        css: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/main.tsx',
                'src/**/*.test.{ts,tsx}',
                'src/test/**',
                // Type-only modules compile away to nothing and cannot be covered.
                'src/models/{comment,pollResult,story,user,settings,index}.ts',
            ],
            thresholds: {
                lines: 80,
                statements: 80,
                functions: 80,
                branches: 80,
            },
        },
    },
});
