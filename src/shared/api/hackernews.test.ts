import { afterEach, describe, expect, it, vi } from 'vitest';
import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernews';

function mockFetch(responses: Record<string, unknown>) {
    return vi.fn(async (url: string) => {
        const path = url.replace(BASE_URL, '');
        if (!(path in responses)) {
            throw new Error(`Unexpected request: ${path}`);
        }
        return { ok: true, json: async () => responses[path] } as Response;
    });
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('hackernews api', () => {
    it('fetches a feed page', async () => {
        const stories = [{ id: 1, title: 'Story' }];
        vi.stubGlobal('fetch', mockFetch({ '/news?page=2': stories }));

        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
    });

    it('fetches a user', async () => {
        vi.stubGlobal('fetch', mockFetch({ '/user/pg': { id: 'pg', karma: 1 } }));

        await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg', karma: 1 });
    });

    it('aggregates poll options and total votes', async () => {
        vi.stubGlobal(
            'fetch',
            mockFetch({
                '/item/10': { id: 10, type: 'poll', poll: [{}, {}] },
                '/item/11': { points: 3, content: 'a' },
                '/item/12': { points: 7, content: 'b' },
            })
        );

        const story = await fetchItemContent(10);

        expect(story.poll).toEqual([
            { points: 3, content: 'a' },
            { points: 7, content: 'b' },
        ]);
        expect(story.poll_votes_count).toBe(10);
    });

    it('rejects on a failed request', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 }) as Response));

        await expect(fetchUser('pg')).rejects.toThrow('failed with status 500');
    });
});
