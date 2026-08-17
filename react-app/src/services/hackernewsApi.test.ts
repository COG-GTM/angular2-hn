import { afterEach, describe, expect, it, vi } from 'vitest';
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

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hackernewsApi', () => {
    it('fetches a feed page', async () => {
        const spy = mockFetch(() => [{ id: 1, title: 'hello' }]);
        const stories = await fetchFeed('news', 2);
        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, undefined);
        expect(stories[0].title).toBe('hello');
    });

    it('resolves poll options and total votes', async () => {
        mockFetch((url) => {
            if (url === `${BASE_URL}/item/10`) {
                return { id: 10, type: 'poll', poll: [{}, {}] };
            }
            return { points: url.endsWith('11') ? 3 : 4, content: url };
        });
        const story = await fetchItemContent(10);
        expect(story.poll.map((option) => option.points)).toEqual([3, 4]);
        expect(story.poll_votes_count).toBe(7);
    });

    it('throws on a failed response', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) })));
        await expect(fetchUser('nobody')).rejects.toThrow('404');
    });
});
