import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent, fetchUser } from './useHackerNewsApi';

const baseUrl = 'https://node-hnapi.herokuapp.com';

function mockFetchOnce(payload: unknown) {
    return vi.fn().mockResolvedValue({
        json: () => Promise.resolve(payload),
    } as Response);
}

describe('useHackerNewsApi data functions', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('fetchFeed requests the feed endpoint with the page query', async () => {
        const stories = [{ id: 1, title: 'Hello' }];
        const fetchMock = mockFetchOnce(stories);
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchFeed('news', 2);

        expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/news?page=2`);
        expect(result).toEqual(stories);
    });

    it('fetchUser requests the user endpoint', async () => {
        const user = { id: 'pg', karma: 100 };
        const fetchMock = mockFetchOnce(user);
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchUser('pg');

        expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/user/pg`);
        expect(result).toEqual(user);
    });

    it('fetchItemContent does not sub-fetch for regular stories', async () => {
        const story = { id: 10, type: 'link', title: 'A story' };
        const fetchMock = mockFetchOnce(story);
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchItemContent(10);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(story);
    });

    it('fetchItemContent resolves poll options and tallies votes', async () => {
        const poll = {
            id: 100,
            type: 'poll',
            poll: [{ points: 0 }, { points: 0 }],
        };
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({ json: () => Promise.resolve(poll) } as Response)
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ points: 3, content: 'A' }),
            } as Response)
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ points: 7, content: 'B' }),
            } as Response);
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenNthCalledWith(2, `${baseUrl}/item/101`);
        expect(fetchMock).toHaveBeenNthCalledWith(3, `${baseUrl}/item/102`);
        expect(result.poll_votes_count).toBe(10);
        expect(result.poll?.[0]).toEqual({ points: 3, content: 'A' });
    });
});
