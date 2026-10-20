import { describe, expect, it } from 'vitest';

import { deferred, jsonResponse, mockFetch, textResponse } from '../test-utils';
import { ApiError, apiUrls, fetchFeed, fetchItem, fetchJson, fetchUser, shouldRetry, toPositiveInt } from './index';

const URL = 'https://example.test/x';

async function rejection(promise: Promise<unknown>): Promise<ApiError> {
    const error = await promise.then(
        () => {
            throw new Error('expected rejection');
        },
        (e: unknown) => e
    );
    expect(error).toBeInstanceOf(ApiError);
    return error as ApiError;
}

describe('fetchJson', () => {
    it('resolves JSON bodies', async () => {
        mockFetch({ [URL]: { a: 1 } });
        await expect(fetchJson(URL)).resolves.toEqual({ a: 1 });
    });

    it('rejects non-ok responses (404 → not-found, 500 → retryable http)', async () => {
        mockFetch({ [URL]: textResponse('nope', 404) });
        expect((await rejection(fetchJson(URL))).kind).toBe('not-found');
        mockFetch({ [URL]: jsonResponse({}, 500) });
        const error = await rejection(fetchJson(URL));
        expect(error).toMatchObject({ kind: 'http', status: 500, retryable: true });
    });

    it('rejects HTTP 200 bodies with an error field (node-hnapi unknown item)', async () => {
        mockFetch({ [URL]: { error: 'Item 999 not found' } });
        const error = await rejection(fetchJson(URL));
        expect(error).toMatchObject({ kind: 'not-found', message: 'Item 999 not found', retryable: false });
    });

    it('rejects null bodies and plain text (HNPWA unknown user)', async () => {
        mockFetch({ [URL]: textResponse('null') });
        expect((await rejection(fetchJson(URL))).kind).toBe('empty');
        mockFetch({ [URL]: textResponse("Cannot read property 'apply' of undefined") });
        expect((await rejection(fetchJson(URL))).kind).toBe('parse');
    });

    it('wraps network failures but rethrows aborts', async () => {
        const handle = mockFetch();
        handle.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
        expect((await rejection(fetchJson(URL))).kind).toBe('network');
        handle.fetch.mockRejectedValueOnce(new DOMException('aborted', 'AbortError'));
        await expect(fetchJson(URL)).rejects.toMatchObject({ name: 'AbortError' });
    });
});

describe('toPositiveInt', () => {
    it.each([
        ['1', 1],
        [' 42 ', 42],
        [7, 7],
    ])('%j → %j', (input, expected) => expect(toPositiveInt(input)).toBe(expected));

    it.each(['0', '-1', '1.5', 'abc', '', '1e3', undefined, null, 0, NaN, 2.5])('%j → NaN', (input) =>
        expect(toPositiveInt(input as string)).toBeNaN()
    );
});

describe('fetchFeed', () => {
    it('requests node-hnapi with the feed and page', async () => {
        const handle = mockFetch({ [apiUrls.feed('show', 2)]: [{ id: 1, title: 'x' }] });
        await expect(fetchFeed('show', '2')).resolves.toEqual([{ id: 1, title: 'x' }]);
        expect(handle.calls[0].url).toBe('https://node-hnapi.herokuapp.com/show?page=2');
    });

    it('rejects invalid pages and feeds without a request', async () => {
        const handle = mockFetch();
        expect((await rejection(fetchFeed('news', 'abc'))).kind).toBe('invalid-param');
        expect((await rejection(fetchFeed('news', 0))).kind).toBe('invalid-param');
        expect((await rejection(fetchFeed('best' as 'news', 1))).kind).toBe('invalid-param');
        expect(handle.calls).toHaveLength(0);
    });

    it('rejects non-array bodies', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: { foo: 1 } });
        expect((await rejection(fetchFeed('news', 1))).kind).toBe('parse');
    });
});

describe('fetchItem', () => {
    it('returns a story with its comments', async () => {
        mockFetch({ [apiUrls.item(5)]: { id: 5, type: 'link', title: 't', comments: [] } });
        await expect(fetchItem('5')).resolves.toMatchObject({ id: 5, title: 't' });
    });

    it('resolves poll options from story.id + i before resolving and sums points', async () => {
        const option2 = deferred<unknown>();
        mockFetch({
            [apiUrls.item(100)]: {
                id: 100,
                type: 'poll',
                poll: [
                    { item: 'A', points: 1 },
                    { item: 'B', points: 2 },
                ],
                comments: [],
            },
            [apiUrls.item(101)]: { id: 101, type: 'pollopt', content: '<p>A', points: 10 },
            [apiUrls.item(102)]: () => option2.promise,
        });
        let settled = false;
        const promise = fetchItem(100).then((story) => {
            settled = true;
            return story;
        });
        await new Promise((r) => setTimeout(r, 10));
        expect(settled).toBe(false);
        option2.resolve({ id: 102, type: 'pollopt', content: '<p>B', points: 5 });
        await expect(promise).resolves.toMatchObject({
            poll: [
                { points: 10, content: '<p>A' },
                { points: 5, content: '<p>B' },
            ],
            poll_votes_count: 15,
        });
    });

    it('falls back to the embedded poll option when its request fails', async () => {
        mockFetch({
            [apiUrls.item(200)]: { id: 200, type: 'poll', poll: [{ item: 'Only', points: 3 }], comments: [] },
            [apiUrls.item(201)]: { error: 'Item 201 not found' },
        });
        await expect(fetchItem(200)).resolves.toMatchObject({
            poll: [{ points: 3, content: 'Only' }],
            poll_votes_count: 3,
        });
    });

    it('rejects unknown and invalid ids', async () => {
        mockFetch({ [apiUrls.item(999)]: { error: 'Item 999 not found' } });
        expect((await rejection(fetchItem(999))).kind).toBe('not-found');
        expect((await rejection(fetchItem('NaN'))).kind).toBe('invalid-param');
        expect((await rejection(fetchItem(-3))).kind).toBe('invalid-param');
    });
});

describe('fetchUser', () => {
    it('reads users from HNPWA', async () => {
        const handle = mockFetch({ [apiUrls.user('pg')]: { id: 'pg', karma: 1, created: 'x', created_time: 1 } });
        await expect(fetchUser('pg')).resolves.toMatchObject({ id: 'pg' });
        expect(handle.calls[0].url).toBe('https://api.hnpwa.com/v0/user/pg.json');
    });

    it('rejects unknown users (null, plain text, missing id) and blank ids', async () => {
        mockFetch({ [apiUrls.user('nobody')]: null });
        expect((await rejection(fetchUser('nobody'))).kind).toBe('empty');
        mockFetch({ [apiUrls.user('nobody')]: textResponse("Cannot read property 'apply' of undefined") });
        expect((await rejection(fetchUser('nobody'))).kind).toBe('parse');
        mockFetch({ [apiUrls.user('nobody')]: { karma: 1 } });
        expect((await rejection(fetchUser('nobody'))).kind).toBe('not-found');
        expect((await rejection(fetchUser('  '))).kind).toBe('invalid-param');
        expect((await rejection(fetchUser(undefined))).kind).toBe('invalid-param');
    });
});

describe('shouldRetry', () => {
    it('never retries non-retryable ApiErrors', () => {
        expect(shouldRetry(0, new ApiError('x', 'invalid-param'))).toBe(false);
        expect(shouldRetry(0, new ApiError('x', 'not-found', { status: 404 }))).toBe(false);
        expect(shouldRetry(0, new ApiError('x', 'http', { status: 400 }))).toBe(false);
        expect(shouldRetry(0, new ApiError('x', 'parse'))).toBe(false);
    });

    it('retries network/5xx/unknown errors up to twice', () => {
        expect(shouldRetry(0, new ApiError('x', 'network'))).toBe(true);
        expect(shouldRetry(1, new ApiError('x', 'http', { status: 503 }))).toBe(true);
        expect(shouldRetry(2, new Error('x'))).toBe(false);
    });
});
