import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernews';

function mockFetch(responses: unknown[]) {
    const fetchMock = vi.fn();
    responses.forEach(body => {
        fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => body });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('hackernews api', () => {
    it('requests the paginated feed', async () => {
        const fetchMock = mockFetch([[{ id: 1 }]]);

        await expect(fetchFeed('news', 2)).resolves.toEqual([{ id: 1 }]);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
    });

    it('rejects on a non-ok response', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

        await expect(fetchUser('alice')).rejects.toThrow('503');
    });

    it('rejects the error envelope returned with a 200 status', async () => {
        mockFetch([{ error: 'Item not found.' }]);

        await expect(fetchItemContent(999)).rejects.toThrow('Item not found.');
    });

    it('fetches every poll option and sums the votes', async () => {
        const fetchMock = mockFetch([
            { id: 5, type: 'poll', poll: [{}, {}] },
            { points: 3, content: 'yes' },
            { points: 7, content: 'no' },
        ]);

        const story = await fetchItemContent(5);

        expect(fetchMock.mock.calls.map(call => call[0])).toEqual([
            `${BASE_URL}/item/5`,
            `${BASE_URL}/item/6`,
            `${BASE_URL}/item/7`,
        ]);
        expect(story.poll).toEqual([
            { points: 3, content: 'yes' },
            { points: 7, content: 'no' },
        ]);
        expect(story.poll_votes_count).toBe(10);
    });
});
