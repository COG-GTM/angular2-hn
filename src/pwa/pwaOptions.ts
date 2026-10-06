import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa';
import { HN_API_BASE_URL } from '../api/hnApi';

type RuntimeCaching = NonNullable<NonNullable<VitePWAOptions['workbox']>['runtimeCaching']>[number];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const HN_FIREBASE_API_BASE_URL = 'https://hacker-news.firebaseio.com/v0';
export const HN_API_CACHE_NAME = 'hn-api';
export const ASSETS_CACHE_NAME = 'assets';

const icon = (size: number) => ({
    src: `/assets/icons/android-chrome-${size}x${size}.png`,
    sizes: `${size}x${size}`,
    type: 'image/png',
});

export const pwaManifest: Partial<ManifestOptions> = {
    id: '/',
    name: 'React HN',
    short_name: 'React HN',
    description: 'A progressive Hacker News client built with React, TypeScript and Vite',
    icons: [icon(144), icon(192), icon(256), icon(512)],
    theme_color: '#b92b27',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/?utm_source=web_app_manifest',
};

export const hnApiRuntimeCaching: RuntimeCaching = {
    urlPattern: new RegExp(`^(?:${[HN_API_BASE_URL, HN_FIREBASE_API_BASE_URL].map(escapeRegExp).join('|')})/`),
    handler: 'NetworkFirst',
    options: {
        cacheName: HN_API_CACHE_NAME,
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
        cacheableResponse: { statuses: [0, 200] },
    },
};

export const assetsRuntimeCaching: RuntimeCaching = {
    urlPattern: /\/assets\/.+\.(?:png|jpe?g|gif|svg|webp|ico|xml)$/i,
    handler: 'CacheFirst',
    options: {
        cacheName: ASSETS_CACHE_NAME,
        expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
        cacheableResponse: { statuses: [0, 200] },
    },
};

export const pwaOptions: Partial<VitePWAOptions> = {
    registerType: 'autoUpdate',
    injectRegister: false,
    includeManifestIcons: false,
    manifest: pwaManifest,
    workbox: {
        globPatterns: ['index.html', 'favicon.ico', '**/*.{js,css}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/__\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [hnApiRuntimeCaching, assetsRuntimeCaching],
    },
};
