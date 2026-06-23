import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  build: {
    target: 'es2016',
    outDir: 'dist/angular-hnpwa',
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['src/app/shared/scss'],
      },
    },
  },
});
