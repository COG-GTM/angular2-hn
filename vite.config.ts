/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React scaffold coexisting with the Angular 9 app.
// Vite uses the root-level index.html as its entry (Angular keeps src/index.html).
export default defineConfig({
    plugins: [react()],
    css: {
        preprocessorOptions: {
            scss: {},
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        passWithNoTests: true,
    },
});
