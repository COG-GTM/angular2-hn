import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews';

function mockFetch(responder: (url: string) => unknown) {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => ({
        ok: true,
        status: 200,
        json: async () => responder(String(input)),
    }));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('fetchFeed', () => {
    it('requests the feed for the given type and page', async () => {
        const fetchMock = mockFetch(() => [{ id: 1 }]);

        await expect(fetchFeed('news', 2)).resolves.toEqual([{ id: 1 }]);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
    });

    it('rejects on a non-ok response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) }))
        );

        await expect(fetchFeed('news', 1)).rejects.toThrow('Request failed with status 503');
    });
});

describe('fetchItemContent', () => {
    it('returns a story unchanged when it is not a poll', async () => {
        const fetchMock = mockFetch(() => ({ id: 7, type: 'story' }));

        await expect(fetchItemContent(7)).resolves.toEqual({ id: 7, type: 'story' });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('fetches each poll option by offset id and sums the votes', async () => {
        const fetchMock = mockFetch((url) => {
            if (url === `${BASE_URL}/item/100`) {
                return { id: 100, type: 'poll', poll: [{}, {}] };
            }
            return { points: url.endsWith('101') ? 3 : 4, content: url };
        });

        const story = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/101`, { signal: undefined });
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/102`, { signal: undefined });
        expect(story.poll).toEqual([
            { points: 3, content: `${BASE_URL}/item/101` },
            { points: 4, content: `${BASE_URL}/item/102` },
        ]);
        expect(story.poll_votes_count).toBe(7);
    });

    it('keeps the story when a poll option request fails', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input: RequestInfo | URL) => {
                const url = String(input);
                if (url === `${BASE_URL}/item/200`) {
                    return { ok: true, status: 200, json: async () => ({ id: 200, type: 'poll', poll: [{}, {}] }) };
                }
                if (url === `${BASE_URL}/item/201`) {
                    return { ok: true, status: 200, json: async () => ({ points: 5, content: 'first' }) };
                }
                return { ok: false, status: 500, json: async () => ({}) };
            })
        );

        const story = await fetchItemContent(200);

        expect(story.poll).toEqual([{ points: 5, content: 'first' }, {}]);
        expect(story.poll_votes_count).toBe(5);
    });
});

describe('fetchPollContent and fetchUser', () => {
    it('hit the item and user endpoints', async () => {
        const fetchMock = mockFetch(() => ({}));

        await fetchPollContent(5);
        await fetchUser('pg');

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/5`, { signal: undefined });
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`, { signal: undefined });
    });
});
