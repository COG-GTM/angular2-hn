import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent, fetchUser } from './hackerNewsApi';

function mockFetch(responses: Record<string, unknown>, status = 200) {
    const fn = vi.fn(async (url: string) => {
        if (!(url in responses)) {
            return new Response('not found', { status: 404 });
        }
        return new Response(JSON.stringify(responses[url]), { status });
    });
    vi.stubGlobal('fetch', fn);
    return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('hackerNewsApi', () => {
    it('fetches a feed page from node-hnapi', async () => {
        const fn = mockFetch({ 'https://node-hnapi.herokuapp.com/newest?page=2': [{ id: 1 }] });
        await expect(fetchFeed('newest', 2)).resolves.toEqual([{ id: 1 }]);
        expect(fn).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/newest?page=2', { signal: undefined });
    });

    it('loads poll options and sums their votes', async () => {
        mockFetch({
            'https://node-hnapi.herokuapp.com/item/10': {
                id: 10,
                type: 'poll',
                poll: [{}, {}],
            },
            'https://node-hnapi.herokuapp.com/item/11': { points: 3, content: 'a' },
            'https://node-hnapi.herokuapp.com/item/12': { points: 5, content: 'b' },
        });
        const story = await fetchItemContent(10);
        expect(story.poll).toEqual([
            { points: 3, content: 'a' },
            { points: 5, content: 'b' },
        ]);
        expect(story.poll_votes_count).toBe(8);
    });

    it('fetches users from HNPWA', async () => {
        mockFetch({ 'https://api.hnpwa.com/v0/user/pg.json': { id: 'pg', karma: 1 } });
        await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg', karma: 1 });
    });

    it('rejects on a non-OK response', async () => {
        mockFetch({});
        await expect(fetchItemContent(99)).rejects.toThrow('404');
    });
});
