import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const HN_API_ORIGIN = 'https://node-hnapi.herokuapp.com';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            // The Web App Manifest is served as the static `public/manifest.json` the Angular app
            // shipped, and `index.html` links it directly, so the plugin must not emit a second one.
            manifest: false,
            injectRegister: 'auto',
            registerType: 'autoUpdate',
            // Only production builds get a service worker, mirroring `enabled: environment.production`.
            devOptions: { enabled: false },
            workbox: {
                // Covers the app shell plus everything copied out of `public/` (icons, images, favicon,
                // the manifest). `includeAssets` is deliberately unset: it would add those same static
                // files a second time with a different revision and Workbox rejects conflicting entries.
                globPatterns: [
                    '**/*.{js,css,html,ico,json,png,jpg,jpeg,gif,webp,svg,cur,ani,eot,otf,ttf,woff,woff2,xml}',
                ],
                navigateFallback: 'index.html',
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.origin === HN_API_ORIGIN,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            networkTimeoutSeconds: 10,
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
        }),
    ],
    build: {
        outDir: 'dist',
    },
});
