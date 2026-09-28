/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      // The theme partials are copied verbatim from the Angular app and still use @import / global color functions.
      scss: { silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div'] },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
