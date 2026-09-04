import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernews-api';

afterEach(() => {
    vi.restoreAllMocks();
});

function mockFetch(responses: Record<string, unknown>) {
    return vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) =>
        Promise.resolve({ json: () => Promise.resolve(responses[String(input)]) } as Response)
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
});
