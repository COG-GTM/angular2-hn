import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernews-api';

afterEach(() => {
    vi.restoreAllMocks();
});

function mockFetch(responses: Record<string, unknown>) {
    return vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(responses[String(input)]),
        } as Response)
    );
}

describe('hackernews api', () => {
    it('fetches a feed page', async () => {
        mockFetch({ [`${BASE_URL}/news?page=2`]: [{ id: 1 }] });
        await expect(fetchFeed('news', 2)).resolves.toEqual([{ id: 1 }]);
    });

    it('fetches a user', async () => {
        mockFetch({ [`${BASE_URL}/user/pg`]: { id: 'pg' } });
        await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg' });
    });

    it('aggregates poll votes when the item is a poll', async () => {
        mockFetch({
            [`${BASE_URL}/item/10`]: { id: 10, type: 'poll', poll: [{}, {}] },
            [`${BASE_URL}/item/11`]: { points: 5, content: 'one' },
            [`${BASE_URL}/item/12`]: { points: 7, content: 'two' },
        });

        const story = await fetchItemContent(10);

        expect(story.poll).toEqual([
            { points: 5, content: 'one' },
            { points: 7, content: 'two' },
        ]);
        expect(story.poll_votes_count).toBe(12);
    });

    it('leaves non-poll items untouched', async () => {
        mockFetch({ [`${BASE_URL}/item/1`]: { id: 1, type: 'story' } });
        const story = await fetchItemContent(1);
        expect(story.poll_votes_count).toBeUndefined();
    });

    it('rejects on an error response instead of parsing the body', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 404,
            json: () => Promise.reject(new Error('should not be called')),
        } as unknown as Response);

        await expect(fetchUser('pg')).rejects.toThrow('404');
    });
});
