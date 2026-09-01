import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from '../hackernews';

function mockFetch(responder: (url: string) => unknown) {
    const spy = vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        return { ok: true, status: 200, json: async () => responder(url) } as Response;
    });
    vi.stubGlobal('fetch', spy);
    return spy;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hackernews api', () => {
    it('requests the feed for the given type and page', async () => {
        const spy = mockFetch(() => [{ id: 1, title: 'a' }]);

        const stories = await fetchFeed('news', 2);

        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
        expect(stories).toHaveLength(1);
    });

    it('requests a user by id', async () => {
        const spy = mockFetch(() => ({ id: 'pg', karma: 1 }));

        await fetchUser('pg');

        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/user/pg`, { signal: undefined });
    });

    it('aggregates poll options and the total vote count', async () => {
        mockFetch((url) => {
            if (url.endsWith('/item/10')) {
                return { id: 10, type: 'poll', poll: [{}, {}] };
            }
            if (url.endsWith('/item/11')) {
                return { points: 3, content: 'option one' };
            }
            return { points: 7, content: 'option two' };
        });

        const story = await fetchItemContent(10);

        expect(story.poll).toEqual([
            { points: 3, content: 'option one' },
            { points: 7, content: 'option two' },
        ]);
        expect(story.poll_votes_count).toBe(10);
    });

    it('leaves non-poll items untouched', async () => {
        mockFetch(() => ({ id: 5, type: 'story', title: 'hello' }));

        const story = await fetchItemContent(5);

        expect(story.poll).toBeUndefined();
        expect(story.poll_votes_count).toBeUndefined();
    });

    it('throws on a failed response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }) as Response)
        );

        await expect(fetchUser('nobody')).rejects.toThrow(/500/);
    });
});
