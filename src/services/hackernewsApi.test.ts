import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFeed, makeStory, makeUser } from '../test/fixtures';
import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernewsApi';

function mockFetchOnce(body: unknown, ok = true, status = 200) {
    return vi.fn().mockResolvedValue({ ok, status, json: async () => body });
}

describe('hackernewsApi', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('requests the paginated feed url', async () => {
        const stories = makeFeed(2);
        vi.stubGlobal('fetch', mockFetchOnce(stories));

        await expect(fetchFeed('news', 3)).resolves.toEqual(stories);
        expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/news?page=3`, { signal: undefined });
    });

    it('passes the abort signal through to fetch', async () => {
        vi.stubGlobal('fetch', mockFetchOnce([]));
        const controller = new AbortController();

        await fetchFeed('jobs', 1, controller.signal);

        expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/jobs?page=1`, { signal: controller.signal });
    });

    it('rejects when the response is not ok', async () => {
        vi.stubGlobal('fetch', mockFetchOnce(null, false, 503));

        await expect(fetchFeed('news', 1)).rejects.toThrow('Request failed with status 503');
    });

    it('fetches a single item without extra requests for regular stories', async () => {
        const story = makeStory({ id: 99 });
        vi.stubGlobal('fetch', mockFetchOnce(story));

        await expect(fetchItemContent(99)).resolves.toEqual(story);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('resolves poll options and totals the votes', async () => {
        const poll = makeStory({
            id: 100,
            type: 'poll',
            poll: [
                { content: 'placeholder a', points: 0 },
                { content: 'placeholder b', points: 0 },
            ],
        });
        const responses = [
            poll,
            { content: 'Option A', points: 30 },
            { content: 'Option B', points: 70 },
        ];
        vi.stubGlobal(
            'fetch',
            vi.fn(async (url: string) => {
                const index = url.endsWith('/item/100') ? 0 : url.endsWith('/item/101') ? 1 : 2;
                return { ok: true, status: 200, json: async () => responses[index] };
            })
        );

        const result = await fetchItemContent(100);

        expect(result.poll).toEqual([
            { content: 'Option A', points: 30 },
            { content: 'Option B', points: 70 },
        ]);
        expect(result.poll_votes_count).toBe(100);
    });

    it('fetches a single poll option', async () => {
        vi.stubGlobal('fetch', mockFetchOnce({ content: 'Option', points: 5 }));

        await expect(fetchPollContent(7)).resolves.toEqual({ content: 'Option', points: 5 });
        expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/item/7`, { signal: undefined });
    });

    it('fetches a user profile', async () => {
        const user = makeUser();
        vi.stubGlobal('fetch', mockFetchOnce(user));

        await expect(fetchUser('alice')).resolves.toEqual(user);
        expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/user/alice`, { signal: undefined });
    });
});
