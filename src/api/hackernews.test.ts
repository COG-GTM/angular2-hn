import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews';

function mockFetchOnce(data: unknown) {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => data,
    });
}

function mockFetchSequence(dataByUrl: Record<string, unknown>) {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
        return Promise.resolve({ json: async () => dataByUrl[url] });
    });
}

describe('hackernews api', () => {
    beforeEach(() => {
        globalThis.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('fetchFeed requests the correct URL per feed type and page', async () => {
        mockFetchOnce([{ id: 1 }]);
        const result = await fetchFeed('news', 1);
        expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/news?page=1`);
        expect(result).toEqual([{ id: 1 }]);

        mockFetchOnce([]);
        await fetchFeed('show', 3);
        expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/show?page=3`);
    });

    it('fetchUser requests the user endpoint', async () => {
        mockFetchOnce({ id: 'pg' });
        const user = await fetchUser('pg');
        expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/user/pg`);
        expect(user).toEqual({ id: 'pg' });
    });

    it('fetchPollContent requests the item endpoint', async () => {
        mockFetchOnce({ points: 5, content: 'a' });
        const poll = await fetchPollContent(42);
        expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/item/42`);
        expect(poll).toEqual({ points: 5, content: 'a' });
    });

    it('fetchItemContent requests a non-poll item without aggregating', async () => {
        mockFetchOnce({ id: 10, type: 'story', title: 'Hello' });
        const story = await fetchItemContent(10);
        expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/item/10`);
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(story.poll_votes_count).toBeUndefined();
    });

    it('fetchItemContent aggregates poll option votes', async () => {
        mockFetchSequence({
            [`${BASE_URL}/item/100`]: {
                id: 100,
                type: 'poll',
                poll: [{}, {}, {}],
            },
            [`${BASE_URL}/item/101`]: { points: 10, content: 'Option A' },
            [`${BASE_URL}/item/102`]: { points: 20, content: 'Option B' },
            [`${BASE_URL}/item/103`]: { points: 30, content: 'Option C' },
        });

        const story = await fetchItemContent(100);

        expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/item/101`);
        expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/item/102`);
        expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/item/103`);
        expect(story.poll).toEqual([
            { points: 10, content: 'Option A' },
            { points: 20, content: 'Option B' },
            { points: 30, content: 'Option C' },
        ]);
        expect(story.poll_votes_count).toBe(60);
    });
});
