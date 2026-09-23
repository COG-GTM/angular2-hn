/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    css: {
        preprocessorOptions: {
            // The theme partials are shared verbatim with the Angular app, which still
            // uses the legacy @import/darken/slash-division syntax.
            scss: { silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div'] },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        css: false,
    },
});
