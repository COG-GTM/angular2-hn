import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent } from './hackerNewsApi';

describe('hackerNewsApi', () => {
    beforeEach(() => vi.restoreAllMocks());
    it('fetches a feed', async () => {
        const response = { ok: true, json: vi.fn().mockResolvedValue([{ id: 1 }]) };
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
        await expect(fetchFeed('news', 2)).resolves.toEqual([{ id: 1 }]);
        expect(fetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2', { signal: undefined });
    });
    it('loads poll options and sums votes', async () => {
        const poll = { id: 10, type: 'poll', poll: [{ points: 0, content: '' }, { points: 0, content: '' }], poll_votes_count: 0 };
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(poll) })
            .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ points: 2, content: 'a' }) })
            .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ points: 3, content: 'b' }) }));
        await expect(fetchItemContent(10)).resolves.toMatchObject({ poll_votes_count: 5, poll: [{ points: 2 }, { points: 3 }] });
        expect(fetch).toHaveBeenCalledTimes(3);
    });
});
