import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent, fetchUser } from './hackernews';
import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';

afterEach(() => {
    vi.restoreAllMocks();
});

function mockFetchSequence(...responses: unknown[]) {
    const fetchMock = vi.fn();
    responses.forEach((body) => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => body,
        });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

describe('hackernews api', () => {
    it('fetchFeed requests the feed endpoint with page query', async () => {
        const stories: Story[] = [{ id: 1, title: 'hello' } as Story];
        const fetchMock = mockFetchSequence(stories);

        const result = await fetchFeed('news', 1);

        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1');
        expect(result).toEqual(stories);
    });

    it('fetchUser requests the user endpoint', async () => {
        const user = { id: 'pg', karma: 100 };
        const fetchMock = mockFetchSequence(user);

        const result = await fetchUser('pg');

        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/pg');
        expect(result).toEqual(user);
    });

    it('fetchItemContent accumulates poll votes before resolving', async () => {
        const poll = { id: 10, type: 'poll', poll: [{}, {}], poll_votes_count: 999 } as unknown as Story;
        const option1: PollResult = { points: 5, content: 'a' };
        const option2: PollResult = { points: 7, content: 'b' };
        const fetchMock = mockFetchSequence(poll, option1, option2);

        const result = await fetchItemContent(10);

        expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://node-hnapi.herokuapp.com/item/11');
        expect(fetchMock).toHaveBeenNthCalledWith(3, 'https://node-hnapi.herokuapp.com/item/12');
        expect(result.poll).toEqual([option1, option2]);
        expect(result.poll_votes_count).toBe(12);
    });

    it('throws on non-ok responses', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Server Error',
            json: async () => ({}),
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(fetchUser('pg')).rejects.toThrow('Request failed: 500');
    });
});
