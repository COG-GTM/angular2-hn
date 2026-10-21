import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Standalone on purpose: vite.config.ts belongs to the PWA child, unit tests must not load it.
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        include: ['src/**/*.test.{ts,tsx}'],
        setupFiles: ['src/shared/test-utils/setup.ts'],
        css: false,
        restoreMocks: true,
    },
});
