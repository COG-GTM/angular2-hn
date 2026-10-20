import { describe, expect, it, vi } from 'vitest';

import { deferred, jsonResponse, mockFetch, textResponse } from '../test-utils';
import {
    ApiError,
    apiUrls,
    fetchFeed,
    fetchItemContent,
    fetchJson,
    fetchPollContent,
    fetchUser,
    queryKeys,
    shouldRetry,
    toPositiveInt,
} from './index';

const story = { id: 1, title: 'A story', type: 'link', comments: [], comments_count: 0 };

describe('fetchJson', () => {
    it('resolves JSON bodies', async () => {
        mockFetch({ 'https://x/ok': { a: 1 } });
        await expect(fetchJson('https://x/ok')).resolves.toEqual({ a: 1 });
    });

    it('rejects non-ok responses (Angular lazyFetch did not)', async () => {
        mockFetch({ 'https://x/500': jsonResponse({ ok: false }, 500) });
        await expect(fetchJson('https://x/500')).rejects.toMatchObject({ name: 'ApiError', kind: 'http', status: 500 });
    });

    it('rejects HTTP 200 bodies with an `error` field', async () => {
        mockFetch({ 'https://x/err': { error: 'Item 9 not found' } });
        await expect(fetchJson('https://x/err')).rejects.toMatchObject({
            kind: 'not-found',
            message: 'Item 9 not found',
        });
    });

    it('rejects a `null` body and a non-JSON body', async () => {
        mockFetch({ 'https://x/null': textResponse('null'), 'https://x/text': textResponse('Cannot read property') });
        await expect(fetchJson('https://x/null')).rejects.toMatchObject({ kind: 'empty' });
        await expect(fetchJson('https://x/text')).rejects.toMatchObject({ kind: 'parse' });
    });

    it('wraps network failures', async () => {
        mockFetch({
            'https://x/down': () => {
                throw new TypeError('Failed to fetch');
            },
        });
        await expect(fetchJson('https://x/down')).rejects.toMatchObject({ kind: 'network', retryable: true });
    });
});

describe('fetchJson body read', () => {
    it('wraps a body that fails mid-read as a network ApiError', async () => {
        const res = { ok: true, status: 200, text: () => Promise.reject(new TypeError('terminated')) };
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res));
        await expect(fetchJson('https://x.test/a')).rejects.toMatchObject({ name: 'ApiError', kind: 'network' });
    });

    it('lets an abort during the body read propagate as AbortError', async () => {
        const res = { ok: true, status: 200, text: () => Promise.reject(new DOMException('aborted', 'AbortError')) };
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res));
        await expect(fetchJson('https://x.test/a')).rejects.toMatchObject({ name: 'AbortError' });
    });
});

describe('fetchPollContent', () => {
    it.each([[0], [NaN], [-3]])('rejects invalid id %j without fetching', async (id) => {
        const handle = mockFetch({});
        await expect(fetchPollContent(id)).rejects.toMatchObject({ kind: 'invalid-param' });
        expect(handle.calls).toHaveLength(0);
    });
});

describe('toPositiveInt', () => {
    it.each([
        ['1', 1],
        [' 42 ', 42],
        [7, 7],
        ['0', NaN],
        ['-1', NaN],
        ['1.5', NaN],
        ['abc', NaN],
        ['12abc', NaN],
        [undefined, NaN],
        [0, NaN],
    ])('%j → %d', (input, expected) => {
        expect(toPositiveInt(input as string | number | undefined)).toBe(expected);
    });
});

describe('fetchFeed', () => {
    it('uses the Angular endpoint', async () => {
        const mock = mockFetch({ 'https://node-hnapi.herokuapp.com/newest?page=2': [story] });
        await expect(fetchFeed('newest', 2)).resolves.toEqual([story]);
        expect(mock.calls[0].url).toBe('https://node-hnapi.herokuapp.com/newest?page=2');
    });

    it('rejects an invalid page without fetching', async () => {
        const mock = mockFetch({});
        await expect(fetchFeed('news', 'abc')).rejects.toMatchObject({ kind: 'invalid-param' });
        expect(mock.calls).toHaveLength(0);
    });
});

describe('fetchItemContent', () => {
    it('rejects unknown items (HTTP 200 {error})', async () => {
        mockFetch({ [apiUrls.item(999)]: { error: 'Item 999 not found' } });
        await expect(fetchItemContent(999)).rejects.toBeInstanceOf(ApiError);
    });

    it('rejects NaN / invalid ids without fetching', async () => {
        const mock = mockFetch({});
        await expect(fetchItemContent(NaN)).rejects.toMatchObject({ kind: 'invalid-param' });
        await expect(fetchItemContent('abc')).rejects.toMatchObject({ kind: 'invalid-param' });
        expect(mock.calls).toHaveLength(0);
    });

    it('maps poll options from item/<id + i> and sums the votes', async () => {
        mockFetch({
            [apiUrls.item(100)]: {
                ...story,
                id: 100,
                type: 'poll',
                poll: [
                    { item: 'A', points: 1 },
                    { item: 'B', points: 2 },
                ],
            },
            [apiUrls.item(101)]: { id: 101, type: 'pollopt', content: '<p>Option A', points: 10 },
            [apiUrls.item(102)]: { id: 102, type: 'pollopt', content: '<p>Option B', points: 5 },
        });
        const result = await fetchItemContent(100);
        expect(result.poll).toEqual([
            { points: 10, content: '<p>Option A' },
            { points: 5, content: '<p>Option B' },
        ]);
        expect(result.poll_votes_count).toBe(15);
    });

    it('falls back to the embedded poll data when an option request fails', async () => {
        mockFetch({
            [apiUrls.item(200)]: { ...story, id: 200, type: 'poll', poll: [{ item: 'Only', points: 3 }] },
            [apiUrls.item(201)]: { error: 'Item 201 not found' },
        });
        const result = await fetchItemContent(200);
        expect(result.poll).toEqual([{ points: 3, content: 'Only' }]);
        expect(result.poll_votes_count).toBe(3);
    });
});

describe('fetchUser', () => {
    it('fetches users from HNPWA', async () => {
        const user = { id: 'pg', created: '20 years ago', created_time: 1, karma: 5 };
        mockFetch({ 'https://api.hnpwa.com/v0/user/pg.json': user });
        await expect(fetchUser('pg')).resolves.toEqual(user);
    });

    it('rejects unknown users answered with HTTP 200 null', async () => {
        mockFetch({ [apiUrls.user('nobody')]: textResponse('null') });
        await expect(fetchUser('nobody')).rejects.toBeInstanceOf(ApiError);
    });

    it('rejects unknown users answered with HTTP 200 plain text', async () => {
        mockFetch({ [apiUrls.user('nobody')]: textResponse("Cannot read property 'apply' of undefined") });
        await expect(fetchUser('nobody')).rejects.toMatchObject({ kind: 'parse' });
    });

    it('rejects an empty id without fetching', async () => {
        const mock = mockFetch({});
        await expect(fetchUser('')).rejects.toMatchObject({ kind: 'invalid-param' });
        await expect(fetchUser(undefined)).rejects.toMatchObject({ kind: 'invalid-param' });
        expect(mock.calls).toHaveLength(0);
    });
});

describe('queryKeys / retry', () => {
    it('builds hierarchical keys', () => {
        expect(queryKeys.feed('news', 1)).toEqual(['hn', 'feed', 'news', 1]);
        expect(queryKeys.item(5)).toEqual(['hn', 'item', 5]);
        expect(queryKeys.user('pg')).toEqual(['hn', 'user', 'pg']);
    });

    it('does not retry non-retryable errors', () => {
        expect(shouldRetry(0, new ApiError('x', 'not-found'))).toBe(false);
        expect(shouldRetry(0, new ApiError('x', 'invalid-param'))).toBe(false);
        expect(shouldRetry(0, new ApiError('x', 'network'))).toBe(true);
        expect(shouldRetry(2, new ApiError('x', 'network'))).toBe(false);
    });
});

describe('mockFetch', () => {
    it('awaits promise responders so requests can be held open', async () => {
        const gate = deferred<unknown>();
        mockFetch({ 'https://x/slow': () => gate.promise });
        let settled = false;
        const pending = fetchJson('https://x/slow').then((v) => {
            settled = true;
            return v;
        });
        await Promise.resolve();
        expect(settled).toBe(false);
        gate.resolve({ late: true });
        await expect(pending).resolves.toEqual({ late: true });
    });

    it('answers unmocked URLs with 404 and records them', async () => {
        const mock = mockFetch({});
        await expect(fetchJson('https://x/none')).rejects.toMatchObject({ status: 404 });
        expect(mock.unmatched).toEqual(['https://x/none']);
    });
});
