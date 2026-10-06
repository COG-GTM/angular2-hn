import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { HN_API_BASE_URL } from '../api/hnApi';
import { HN_API_CACHE_NAME, HN_FIREBASE_API_BASE_URL, pwaManifest, pwaOptions } from './pwaOptions';

describe('pwaOptions', () => {
    it('describes the React HN web app manifest', () => {
        expect(pwaManifest).toMatchObject({
            name: 'React HN',
            short_name: 'React HN',
            theme_color: '#b92b27',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            start_url: '/?utm_source=web_app_manifest',
        });
        expect(pwaManifest.icons?.map((i) => i.sizes)).toEqual(['144x144', '192x192', '256x256', '512x512']);
    });

    it('points every manifest icon at a file in public/', () => {
        for (const { src } of pwaManifest.icons ?? []) {
            expect(existsSync(resolve(__dirname, '../../public', `.${src}`)), src).toBe(true);
        }
    });

    it('auto-updates and falls back to the app shell for client routes', () => {
        expect(pwaOptions.registerType).toBe('autoUpdate');
        expect(pwaOptions.workbox?.navigateFallback).toBe('/index.html');
        expect(pwaOptions.workbox?.globPatterns).toEqual(expect.arrayContaining(['index.html', 'favicon.ico']));
    });

    it('caches HNPWA and HN Firebase API responses network-first in hn-api', () => {
        const rule = pwaOptions.workbox?.runtimeCaching?.find((r) => r.options?.cacheName === HN_API_CACHE_NAME);
        expect(rule).toBeDefined();
        expect(rule?.handler).toBe('NetworkFirst');
        expect(rule?.options).toMatchObject({
            networkTimeoutSeconds: 3,
            expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
            cacheableResponse: { statuses: [0, 200] },
        });
        const pattern = rule?.urlPattern as RegExp;
        expect(pattern.test(`${HN_API_BASE_URL}/news/1.json`)).toBe(true);
        expect(pattern.test(`${HN_API_BASE_URL}/item/8863.json`)).toBe(true);
        expect(pattern.test(`${HN_FIREBASE_API_BASE_URL}/item/126809.json`)).toBe(true);
        expect(pattern.test('https://hacker-news.firebaseio.com/v1/item/1.json')).toBe(false);
        expect(pattern.test('https://example.com/v0/news/1.json')).toBe(false);
    });
});
