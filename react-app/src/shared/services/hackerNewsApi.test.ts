import { afterEach, describe, expect, it, vi } from 'vitest';
import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackerNewsApi';
import type { Story } from '../models/story';

function mockFetch(payload: unknown) {
    const fetchMock = vi.fn().mockResolvedValue({ json: () => Promise.resolve(payload) });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hackerNewsApi', () => {
    it('fetchFeed requests the feed url with the page number and returns stories', async () => {
        const stories = [{ id: 1, title: 'A story' }] as Story[];
        const fetchMock = mockFetch(stories);

        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
    });

    it('fetchFeed forwards an abort signal', async () => {
        const fetchMock = mockFetch([]);
        const controller = new AbortController();

        await fetchFeed('ask', 1, controller.signal);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/ask?page=1`, { signal: controller.signal });
    });

    it('fetchFeed rejects when the request fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

        await expect(fetchFeed('news', 1)).rejects.toThrow('offline');
    });

    it('fetchItemContent resolves poll options and totals their points', async () => {
        const poll = { id: 10, type: 'poll', poll: [{}, {}] } as unknown as Story;
        const fetchMock = vi.fn().mockImplementation((url: string) => ({
            json: () =>
                Promise.resolve(
                    url.endsWith('/item/10')
                        ? poll
                        : { id: Number(url.split('/').pop()), title: url, points: 5 }
                ),
        }));
        vi.stubGlobal('fetch', fetchMock);

        const story = await fetchItemContent(10);

        expect(story.poll_votes_count).toBe(10);
        expect(story.poll.map(option => option.id)).toEqual([11, 12]);
    });

    it('fetchUser requests the user url', async () => {
        const fetchMock = mockFetch({ id: 'pg', karma: 1 });

        await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg', karma: 1 });
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`, { signal: undefined });
    });
});
