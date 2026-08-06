/// <reference types="vitest/config" />
import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['import', 'slash-div', 'color-functions', 'global-builtin'],
      },
    },
  },
  test: {
    exclude: [...configDefaults.exclude, 'src/app/**', 'e2e/**'],
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
  },
});
