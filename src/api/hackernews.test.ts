import { afterEach, describe, expect, it, vi } from 'vitest';

import { baseUrl, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews';

function mockFetch(responder: (url: string) => unknown) {
    const fetchMock = vi.fn((url: string) => Promise.resolve({ json: () => Promise.resolve(responder(url)) }));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hackernews api', () => {
    it('fetches a feed page', async () => {
        const fetchMock = mockFetch(() => [{ id: 1 }]);

        await expect(fetchFeed('news', 2)).resolves.toEqual([{ id: 1 }]);
        expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/news?page=2`, { signal: undefined });
    });

    it('fetches a user', async () => {
        const fetchMock = mockFetch(() => ({ id: 'pg' }));

        await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg' });
        expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/user/pg`, { signal: undefined });
    });

    it('fetches a poll result', async () => {
        const fetchMock = mockFetch(() => ({ points: 5, content: 'option' }));

        await expect(fetchPollContent(11)).resolves.toEqual({ points: 5, content: 'option' });
        expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/item/11`, { signal: undefined });
    });

    it('returns a non-poll item unchanged', async () => {
        mockFetch(() => ({ id: 10, type: 'story' }));

        await expect(fetchItemContent(10)).resolves.toEqual({ id: 10, type: 'story' });
    });

    it('aggregates poll option votes', async () => {
        const options: Record<string, unknown> = {
            [`${baseUrl}/item/11`]: { points: 3, content: 'a' },
            [`${baseUrl}/item/12`]: { points: 4, content: 'b' },
        };
        mockFetch((url) => options[url] ?? { id: 10, type: 'poll', poll: [{}, {}] });

        const story = await fetchItemContent(10);

        expect(story.poll).toEqual([
            { points: 3, content: 'a' },
            { points: 4, content: 'b' },
        ]);
        expect(story.poll_votes_count).toBe(7);
    });

    it('skips aggregation when a poll item has no options', async () => {
        mockFetch(() => ({ id: 10, type: 'poll' }));

        const story = await fetchItemContent(10);

        expect(story.poll_votes_count).toBeUndefined();
    });

    it('passes an abort signal through', async () => {
        const fetchMock = mockFetch(() => []);
        const controller = new AbortController();

        await fetchFeed('ask', 1, controller.signal);

        expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/ask?page=1`, { signal: controller.signal });
    });
});
