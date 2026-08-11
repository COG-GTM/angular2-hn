import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'assets/**/*'],
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
                icons: [144, 192, 256, 512].map(function (size) { return ({
                    src: "assets/icons/android-chrome-".concat(size, "x").concat(size, ".png"),
                    sizes: "".concat(size, "x").concat(size),
                    type: 'image/png',
                }); }),
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
            },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'legacy-js-api'],
            },
        },
    },
    server: {
        port: 4200,
    },
});
