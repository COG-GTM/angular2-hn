import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Standalone on purpose: vite.config.ts belongs to Phase 3 (PWA), tests must not load it.
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        include: ['src-react/**/*.test.{ts,tsx}'],
        setupFiles: ['src-react/shared/test-utils/setup.ts'],
        css: false,
        restoreMocks: true,
    },
});
