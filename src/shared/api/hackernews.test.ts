import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernews';

function mockFetchResponses(responses: Record<string, unknown>) {
    return vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => ({
            ok: true,
            json: async () => responses[url],
        }))
    );
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('fetchFeed', () => {
    it('fetches the feed for a type and page', async () => {
        const stories = [{ id: 1, title: 'Hello' }];
        mockFetchResponses({ [`${BASE_URL}/news?page=2`]: stories });
        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
    });
});

describe('fetchItemContent', () => {
    it('fetches a plain story', async () => {
        const story = { id: 10, type: 'story', title: 'A story' };
        mockFetchResponses({ [`${BASE_URL}/item/10`]: story });
        await expect(fetchItemContent(10)).resolves.toEqual(story);
    });

    it('fetches poll options and sums poll_votes_count', async () => {
        const poll = { id: 100, type: 'poll', poll: [{}, {}] };
        mockFetchResponses({
            [`${BASE_URL}/item/100`]: poll,
            [`${BASE_URL}/item/101`]: { points: 3, content: 'a' },
            [`${BASE_URL}/item/102`]: { points: 4, content: 'b' },
        });
        const result = await fetchItemContent(100);
        expect(result.poll_votes_count).toBe(7);
        expect(result.poll).toEqual([
            { points: 3, content: 'a' },
            { points: 4, content: 'b' },
        ]);
    });
});

describe('fetchUser', () => {
    it('fetches a user by id', async () => {
        const user = { id: 'pg', karma: 155111 };
        mockFetchResponses({ [`${BASE_URL}/user/pg`]: user });
        await expect(fetchUser('pg')).resolves.toEqual(user);
    });
});
