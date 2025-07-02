import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'React HN Client',
          short_name: 'React HN',
          description: 'Hacker News client built with React',
          theme_color: '#b92b27',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: './?utm_source=web_app_manifest',
          icons: [
            {
              src: 'assets/icons/android-chrome-144x144.png',
              sizes: '144x144',
              type: 'image/png'
            },
            {
              src: 'assets/icons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'assets/icons/android-chrome-256x256.png',
              sizes: '256x256',
              type: 'image/png'
            },
            {
              src: 'assets/icons/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
      chunkSizeWarningLimit: 2000,
    },
    server: {
      port: 3000,
      open: true,
      host: true,
    },
    preview: {
      port: 4173,
      host: true,
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})

