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

    it('keeps the item when a poll option request fails', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input: RequestInfo | URL) => {
                const url = String(input);
                if (url.endsWith('/item/100')) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => ({ id: 100, type: 'poll', poll: [{ points: 0, content: 'a' }, {}] }),
                    };
                }
                if (url.endsWith('/item/101')) {
                    return { ok: false, status: 500, json: async () => ({}) };
                }
                return { ok: true, status: 200, json: async () => ({ points: 7, content: 'option' }) };
            })
        );

        const item = await fetchItemContent(100);

        expect(item.poll).toEqual([
            { points: 0, content: 'a' },
            { points: 7, content: 'option' },
        ]);
        expect(item.poll_votes_count).toBe(7);
    });

    it('throws when the API answers 200 with an error body', async () => {
        mockFetch(() => ({ error: 'Item 999 not found' }));

        await expect(fetchItemContent(999)).rejects.toThrow('Item 999 not found');
    });

    it('throws when the response is not ok', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }))
        );

        await expect(fetchFeed('news', 1)).rejects.toThrow('failed with status 500');
    });
});
