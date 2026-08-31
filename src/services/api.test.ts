import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchFeed, fetchItemContent } from './api';

describe('Hacker News API', () => {
    beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
    afterEach(() => vi.unstubAllGlobals());
    it('constructs feed URLs', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => [] } as Response);
        await fetchFeed('news', 2);
        expect(fetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2', undefined);
    });
    it('aggregates poll option results', async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 10, type: 'poll', poll: [{ points: 0 }, { points: 0 }] }) } as Response)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ points: 3, content: 'A' }) } as Response)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ points: 2, content: 'B' }) } as Response);
        const item = await fetchItemContent(10);
        expect(item.poll_votes_count).toBe(5);
        expect(item.poll).toEqual([{ points: 3, content: 'A' }, { points: 2, content: 'B' }]);
    });
});
