import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernewsApi';

function mockFetch(handler: (url: string) => unknown) {
    const spy = vi.fn(async (input: RequestInfo | URL) => ({
        ok: true,
        status: 200,
        json: async () => handler(String(input)),
    }));
    vi.stubGlobal('fetch', spy);
    return spy;
}

describe('hackernewsApi', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    it('fetches a feed page', async () => {
        const spy = mockFetch(() => [{ id: 1 }]);
        const stories = await fetchFeed('news', 2);

        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
        expect(stories).toEqual([{ id: 1 }]);
    });

    it('fetches a user', async () => {
        mockFetch(() => ({ id: 'devin', karma: 10 }));
        await expect(fetchUser('devin')).resolves.toEqual({ id: 'devin', karma: 10 });
    });

    it('resolves poll options and totals their points', async () => {
        mockFetch((url) => {
            if (url.endsWith('/item/100')) {
                return { id: 100, type: 'poll', poll: [{}, {}] };
            }
            return { points: url.endsWith('/item/101') ? 3 : 7, content: 'option' };
        });

        const item = await fetchItemContent(100);

        expect(item.poll).toEqual([
            { points: 3, content: 'option' },
            { points: 7, content: 'option' },
        ]);
        expect(item.poll_votes_count).toBe(10);
    });

    it('throws when the response is not ok', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }))
        );

        await expect(fetchFeed('news', 1)).rejects.toThrow('failed with status 500');
    });
});
