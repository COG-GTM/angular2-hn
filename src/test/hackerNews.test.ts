import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from '../api/hackerNews';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function jsonResponse(data: unknown, ok = true) {
    return Promise.resolve({
        ok,
        json: () => Promise.resolve(data),
    });
}

beforeEach(() => {
    mockFetch.mockReset();
});

describe('fetchFeed', () => {
    it('fetches feed and returns stories', async () => {
        const stories = [{ id: 1, title: 'Test' }];
        mockFetch.mockReturnValueOnce(jsonResponse(stories));
        const result = await fetchFeed('news', 1);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/news?page=1',
            { signal: undefined }
        );
        expect(result).toEqual(stories);
    });

    it('throws on non-ok response', async () => {
        mockFetch.mockReturnValueOnce(jsonResponse(null, false));
        await expect(fetchFeed('news', 1)).rejects.toThrow('Failed to fetch news feed');
    });

    it('passes AbortSignal through', async () => {
        const controller = new AbortController();
        mockFetch.mockReturnValueOnce(jsonResponse([]));
        await fetchFeed('news', 1, controller.signal);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/news?page=1',
            { signal: controller.signal }
        );
    });
});

describe('fetchItemContent', () => {
    it('fetches a non-poll story', async () => {
        const story = { id: 100, type: 'story', title: 'Hello' };
        mockFetch.mockReturnValueOnce(jsonResponse(story));
        const result = await fetchItemContent(100);
        expect(result).toEqual(story);
    });

    it('fetches poll and aggregates poll results', async () => {
        const story = { id: 200, type: 'poll', poll: [{}, {}] };
        const poll1 = { points: 10, content: 'A' };
        const poll2 = { points: 20, content: 'B' };
        mockFetch
            .mockReturnValueOnce(jsonResponse(story))
            .mockReturnValueOnce(jsonResponse(poll1))
            .mockReturnValueOnce(jsonResponse(poll2));

        const result = await fetchItemContent(200);
        expect(result.poll).toEqual([poll1, poll2]);
        expect(result.poll_votes_count).toBe(30);
        expect(mockFetch).toHaveBeenCalledTimes(3);
    });
});

describe('fetchPollContent', () => {
    it('fetches poll content by id', async () => {
        const poll = { points: 5, content: 'Option' };
        mockFetch.mockReturnValueOnce(jsonResponse(poll));
        const result = await fetchPollContent(42);
        expect(result).toEqual(poll);
    });
});

describe('fetchUser', () => {
    it('fetches user by id', async () => {
        const user = { id: 'jsmith', karma: 100 };
        mockFetch.mockReturnValueOnce(jsonResponse(user));
        const result = await fetchUser('jsmith');
        expect(result).toEqual(user);
    });

    it('throws on non-ok response', async () => {
        mockFetch.mockReturnValueOnce(jsonResponse(null, false));
        await expect(fetchUser('nobody')).rejects.toThrow('Failed to fetch user nobody');
    });
});
