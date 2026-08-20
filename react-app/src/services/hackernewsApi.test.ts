import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernewsApi';

function mockFetch(payload: unknown) {
    const spy = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    vi.stubGlobal('fetch', spy);
    return spy;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hackernewsApi', () => {
    it('requests the feed for the given type and page', async () => {
        const spy = mockFetch([{ id: 1 }]);
        const stories = await fetchFeed('news', 2);

        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
        expect(stories).toHaveLength(1);
    });

    it('requests a user profile', async () => {
        const spy = mockFetch({ id: 'pg', karma: 100 });
        const user = await fetchUser('pg');

        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/user/pg`, { signal: undefined });
        expect(user.karma).toBe(100);
    });

    it('resolves poll options and totals their points', async () => {
        const spy = vi
            .fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 10, type: 'poll', poll: [{}, {}] }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ points: 3, content: 'a' }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ points: 4, content: 'b' }) });
        vi.stubGlobal('fetch', spy);

        const story = await fetchItemContent(10);

        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/item/11`, { signal: undefined });
        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/item/12`, { signal: undefined });
        expect(story.poll_votes_count).toBe(7);
    });

    it('throws when the response is not ok', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
        await expect(fetchUser('pg')).rejects.toThrow('Request failed with status 500');
    });
});
