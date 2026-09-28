import { afterEach, describe, expect, it, vi } from 'vitest';

import { HN_API_BASE_URL, fetchFeed, fetchItem, fetchUser, listStartForPage } from './client';

function mockFetch(responder: (url: string) => unknown) {
    const spy = vi.fn(async (input: RequestInfo | URL) => ({
        ok: true,
        status: 200,
        json: async () => responder(String(input)),
    }));
    vi.stubGlobal('fetch', spy);
    return spy;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hacker news api client', () => {
    it('requests the same feed endpoint and page query as the Angular service', async () => {
        const spy = mockFetch(() => []);
        await fetchFeed('show', 3);
        expect(spy).toHaveBeenCalledWith(`${HN_API_BASE_URL}/show?page=3`, { signal: undefined });
    });

    it('requests the item and user endpoints unchanged', async () => {
        const spy = mockFetch((url) => (url.includes('/user/') ? { id: 'pg' } : { id: 1, type: 'story' }));
        await fetchItem(8863);
        await fetchUser('pg');
        expect(spy).toHaveBeenNthCalledWith(1, `${HN_API_BASE_URL}/item/8863`, { signal: undefined });
        expect(spy).toHaveBeenNthCalledWith(2, `${HN_API_BASE_URL}/user/pg`, { signal: undefined });
    });

    it('resolves poll options from consecutive item ids and totals their points', async () => {
        mockFetch((url) => {
            if (url.endsWith('/item/100')) {
                return { id: 100, type: 'poll', poll: [{}, {}] };
            }
            const id = Number(url.split('/item/')[1]);
            return { points: id, content: `option ${id}` };
        });

        const story = await fetchItem(100);

        expect(story.poll).toEqual([
            { points: 101, content: 'option 101' },
            { points: 102, content: 'option 102' },
        ]);
        expect(story.poll_votes_count).toBe(203);
    });

    it('throws on a non-ok response', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })));
        await expect(fetchUser('pg')).rejects.toThrow('503');
    });

    it('keeps rank numbering continuous across pages', () => {
        expect(listStartForPage(1)).toBe(1);
        expect(listStartForPage(2)).toBe(31);
        expect(listStartForPage(3)).toBe(61);
    });
});
