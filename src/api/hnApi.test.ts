import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent, fetchUser, HN_API_BASE_URL, HN_FIREBASE_API_BASE_URL, HnApiError } from './hnApi';

function mockFetch(responses: Record<string, unknown>, status = 200) {
    const fn = vi.fn(async (url: string) => {
        const path = url.replace(HN_API_BASE_URL, '');
        if (!(path in responses)) {
            return new Response('Not found', { status: 404 });
        }
        return new Response(JSON.stringify(responses[path]), { status });
    });
    vi.stubGlobal('fetch', fn);
    return fn;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hnApi', () => {
    it('fetchFeed requests the feed page', async () => {
        const fetchSpy = mockFetch({ '/newest/2.json': [{ id: 1, title: 'a' }] });
        const items = await fetchFeed('newest', 2);
        expect(fetchSpy).toHaveBeenCalledWith(`${HN_API_BASE_URL}/newest/2.json`, { signal: undefined });
        expect(items).toEqual([{ id: 1, title: 'a' }]);
    });

    it('fetchUser requests the user profile', async () => {
        mockFetch({ '/user/pg.json': { id: 'pg', karma: 10 } });
        await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg', karma: 10 });
    });

    it('fetchItemContent returns a regular story unchanged', async () => {
        mockFetch({ '/item/5.json': { id: 5, type: 'link', comments: [] } });
        await expect(fetchItemContent(5)).resolves.toEqual({ id: 5, type: 'link', comments: [] });
    });

    it('fetchItemContent loads poll options and sums votes', async () => {
        mockFetch({
            '/item/10.json': { id: 10, type: 'poll', poll: [{}, {}] },
            '/item/11.json': { points: 3, content: 'yes' },
            '/item/12.json': { points: 7, content: 'no' },
        });
        const story = await fetchItemContent(10);
        expect(story.poll).toEqual([
            { points: 3, content: 'yes' },
            { points: 7, content: 'no' },
        ]);
        expect(story.poll_votes_count).toBe(10);
    });

    it('fetchItemContent reads poll option ids from the HN API when the poll list is missing', async () => {
        const fetchSpy = mockFetch({
            '/item/20.json': { id: 20, type: 'poll', comments: [] },
            [`${HN_FIREBASE_API_BASE_URL}/item/20.json`]: { id: 20, parts: [31, 32] },
            '/item/31.json': { points: 1, content: 'a' },
            '/item/32.json': { points: 4, content: 'b' },
        });
        const story = await fetchItemContent(20);
        expect(fetchSpy).toHaveBeenCalledWith(`${HN_FIREBASE_API_BASE_URL}/item/20.json`, { signal: undefined });
        expect(story.poll).toEqual([
            { points: 1, content: 'a' },
            { points: 4, content: 'b' },
        ]);
        expect(story.poll_votes_count).toBe(5);
    });

    it('throws HnApiError on non-OK responses', async () => {
        mockFetch({});
        await expect(fetchFeed('news', 1)).rejects.toBeInstanceOf(HnApiError);
    });

    it('throws HnApiError when the API returns null', async () => {
        mockFetch({ '/item/1.json': null });
        await expect(fetchItemContent(1)).rejects.toBeInstanceOf(HnApiError);
    });
});
