import { describe, it, expect, vi, afterEach } from 'vitest';
import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews';
import { itemWithComments, pollItem, pollOption1, pollOption2, sampleUser } from '../test/fixtures';

function jsonResponse(data: unknown) {
    return { json: () => Promise.resolve(data) } as Response;
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('hackernews api', () => {
    it('fetchFeed builds the correct URL', async () => {
        const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([]));
        await fetchFeed('news', 2);
        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, undefined);
    });

    it('fetchFeed passes the abort signal', async () => {
        const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([]));
        const controller = new AbortController();
        await fetchFeed('show', 1, controller.signal);
        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/show?page=1`, { signal: controller.signal });
    });

    it('fetchUser returns parsed data from the correct URL', async () => {
        const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(sampleUser));
        const user = await fetchUser('alice');
        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/user/alice`, undefined);
        expect(user).toEqual(sampleUser);
    });

    it('fetchPollContent hits the item endpoint', async () => {
        const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(pollOption1));
        const result = await fetchPollContent(601);
        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/item/601`, undefined);
        expect(result).toEqual(pollOption1);
    });

    it('fetchItemContent returns parsed data for a normal item', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(itemWithComments));
        const item = await fetchItemContent(500);
        expect(item.id).toBe(500);
        expect(item.comments).toHaveLength(2);
    });

    it('fetchItemContent fetches each poll option and sums poll_votes_count', async () => {
        const spy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
            const url = String(input);
            if (url.endsWith('/item/600')) {
                return Promise.resolve(jsonResponse({ ...pollItem }));
            }
            if (url.endsWith('/item/601')) {
                return Promise.resolve(jsonResponse(pollOption1));
            }
            if (url.endsWith('/item/602')) {
                return Promise.resolve(jsonResponse(pollOption2));
            }
            return Promise.reject(new Error('unexpected url ' + url));
        });

        const item = await fetchItemContent(600);

        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/item/601`, undefined);
        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/item/602`, undefined);
        expect(item.poll[0]).toEqual(pollOption1);
        expect(item.poll[1]).toEqual(pollOption2);
        expect(item.poll_votes_count).toBe(40);
    });

    it('propagates errors', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
        await expect(fetchUser('alice')).rejects.toThrow('network down');
    });
});
