import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchUser } from './hackernews-api';

afterEach(() => {
    vi.restoreAllMocks();
});

function mockFetch(payload: unknown, ok = true) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok,
        status: ok ? 200 : 500,
        json: () => Promise.resolve(payload),
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

describe('hackernews-api', () => {
    it('requests the feed for a given type and page', async () => {
        const fetchMock = mockFetch([{ id: 1 }]);

        const stories = await fetchFeed('news', 2);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
        expect(stories).toEqual([{ id: 1 }]);
    });

    it('throws when the response is not ok', async () => {
        mockFetch(null, false);

        await expect(fetchUser('pg')).rejects.toThrow('Request failed with status 500');
    });
});
