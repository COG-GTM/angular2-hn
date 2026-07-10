import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React + TypeScript build for the Angular -> React migration.
// The Vite entry HTML lives at the repo root (index.html) and mounts into
// <div id="root">; static assets are served from ./public.
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist/react',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
