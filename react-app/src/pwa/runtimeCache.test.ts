import { describe, expect, it } from 'vitest';

import { HN_API_BASE_URL, HNPWA_API_BASE_URL } from '../shared/api';
import { FEED_TYPES } from '../shared/models';
import { API_CACHES, APP_ROUTE_PREFIXES, escapeRegExp, isRuntimeCachedUrl, STATIC_FILE_PATTERN } from './runtimeCache';

describe('runtimeCache', () => {
    it('caches both API origins the shared client calls', () => {
        const origins = API_CACHES.map(({ origin }) => origin);
        expect(origins).toContain(new URL(HN_API_BASE_URL).origin);
        expect(origins).toContain(new URL(HNPWA_API_BASE_URL).origin);
    });

    it('matches API URLs only on the exact origin', () => {
        expect(isRuntimeCachedUrl('https://node-hnapi.herokuapp.com/news?page=1')).toBe(true);
        expect(isRuntimeCachedUrl('https://api.hnpwa.com/v0/user/pg.json')).toBe(true);
        expect(isRuntimeCachedUrl('https://node-hnapi.herokuapp.com.evil.test/news')).toBe(false);
        expect(isRuntimeCachedUrl('http://localhost:4173/assets/index.js')).toBe(false);
    });

    it('denies the SPA fallback only for static files', () => {
        for (const path of [
            '/assets/index-abc.js',
            '/manifest.webmanifest',
            '/favicon.ico',
            '/sw.js',
            '/a/b.PNG',
            '/assets/images/logo.svg?v=2',
            '/users/x.json',
        ]) {
            expect(STATIC_FILE_PATTERN.test(path), path).toBe(true);
        }
        for (const path of [
            '/news/1',
            '/item/8863',
            '/user/a.b',
            '/user/john.doe',
            '/user/john.json',
            '/user/x.png?ref=1',
            '/',
            '/?utm_source=web_app_manifest',
            '/a.b/c',
        ]) {
            expect(STATIC_FILE_PATTERN.test(path), path).toBe(false);
        }
    });

    it('exempts every client route prefix', () => {
        expect([...APP_ROUTE_PREFIXES].sort()).toEqual([...FEED_TYPES, 'item', 'user'].sort());
    });

    it('escapes regular-expression characters', () => {
        const pattern = new RegExp(`^${escapeRegExp('https://api.hnpwa.com')}/`);
        expect(pattern.test('https://api.hnpwa.com/v0/news/1.json')).toBe(true);
        expect(pattern.test('https://apiXhnpwa.com/v0/news/1.json')).toBe(false);
    });
});
