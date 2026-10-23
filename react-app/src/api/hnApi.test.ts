import { describe, expect, it } from 'vitest';

import { mockFetch, textResponse } from '../test';
import { ApiError } from './ApiError';
import { apiUrls, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hnApi';

describe('hnApi', () => {
    it('fetchFeed requests /{feedType}?page=N', async () => {
        const stories = [{ id: 1, title: 'A' }];
        const { callsTo } = mockFetch({ [apiUrls.feed('newest', 2)]: stories });
        await expect(fetchFeed('newest', '2')).resolves.toEqual(stories);
        expect(callsTo('https://node-hnapi.herokuapp.com/newest?page=2')).toHaveLength(1);
    });

    it('fetchFeed rejects invalid pages without a request', async () => {
        const { calls } = mockFetch();
        await expect(fetchFeed('news', 'abc')).rejects.toMatchObject({ kind: 'invalid-param' });
        expect(calls).toHaveLength(0);
    });

    it('rejects HTTP errors, node-hnapi {error} bodies and non-JSON bodies', async () => {
        mockFetch({
            [apiUrls.feed('news', 1)]: textResponse('boom', 500),
            [apiUrls.item(9)]: { error: 'Item 9 not found' },
            [apiUrls.user('nobody')]: textResponse("Cannot read property 'apply' of undefined"),
        });
        await expect(fetchFeed('news', 1)).rejects.toMatchObject({ kind: 'http', status: 500 });
        await expect(fetchItemContent(9)).rejects.toMatchObject({ kind: 'not-found' });
        await expect(fetchUser('nobody')).rejects.toBeInstanceOf(ApiError);
    });

    it('fetchUser rejects a null body and uses HNPWA', async () => {
        mockFetch({ [apiUrls.user('ghost')]: null, [apiUrls.user('pg')]: { id: 'pg', karma: 1, created: 'x' } });
        expect(apiUrls.user('pg')).toBe('https://api.hnpwa.com/v0/user/pg.json');
        await expect(fetchUser('ghost')).rejects.toMatchObject({ kind: 'empty' });
        await expect(fetchUser('pg')).resolves.toMatchObject({ id: 'pg' });
    });

    it('fetchItemContent fetches poll options at story.id + i and sums poll_votes_count', async () => {
        mockFetch({
            [apiUrls.item(100)]: { id: 100, type: 'poll', poll: [{ item: 'a' }, { item: 'b' }], comments: [] },
            [apiUrls.item(101)]: { points: 3, content: '<p>A</p>' },
            [apiUrls.item(102)]: { points: 5, content: '<p>B</p>' },
        });
        const story = await fetchItemContent('100');
        expect(story.poll).toEqual([
            { points: 3, content: '<p>A</p>' },
            { points: 5, content: '<p>B</p>' },
        ]);
        expect(story.poll_votes_count).toBe(8);
    });

    it('fetchPollContent defaults missing points to 0', async () => {
        mockFetch({ [apiUrls.item(7)]: { content: 'x' } });
        await expect(fetchPollContent(7)).resolves.toEqual({ points: 0, content: 'x' });
    });

    it('cancels with AbortController (rejects with AbortError)', async () => {
        mockFetch({ [apiUrls.item(1)]: () => new Promise(() => {}) });
        const controller = new AbortController();
        const pending = fetchItemContent(1, controller.signal);
        controller.abort();
        await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    });
});
