import type { Story, User } from '../models';
import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews-api';

function jsonResponse(body: unknown): Response {
    return { json: () => Promise.resolve(body) } as unknown as Response;
}

describe('hackernews-api', () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('uses the node-hnapi base url', () => {
        expect(BASE_URL).toBe('https://node-hnapi.herokuapp.com');
    });

    it('fetchFeed requests the feed endpoint with the page', async () => {
        const stories = [{ id: 1, title: 'Hello' }] as Story[];
        fetchMock.mockResolvedValueOnce(jsonResponse(stories));

        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/news?page=2`);
    });

    it('fetchPollContent requests the item endpoint', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ points: 3, content: 'Option' }));

        await expect(fetchPollContent(42)).resolves.toEqual({ points: 3, content: 'Option' });
        expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/item/42`);
    });

    it('fetchUser requests the user endpoint', async () => {
        const user = { id: 'pg', karma: 1 } as User;
        fetchMock.mockResolvedValueOnce(jsonResponse(user));

        await expect(fetchUser('pg')).resolves.toEqual(user);
        expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/user/pg`);
    });

    it('fetchItemContent returns a story untouched when it is not a poll', async () => {
        const story = { id: 10, type: 'story', title: 'Story', comments: [] } as unknown as Story;
        fetchMock.mockResolvedValueOnce(jsonResponse(story));

        await expect(fetchItemContent(10)).resolves.toEqual(story);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/item/10`);
    });

    it('fetchItemContent fetches each poll option (id + i) and sums poll_votes_count', async () => {
        const poll = {
            id: 100,
            type: 'poll',
            title: 'Poll',
            poll: [{}, {}, {}],
        } as unknown as Story;
        fetchMock.mockImplementation((input) => {
            const url = String(input);
            if (url.endsWith('/item/100')) return Promise.resolve(jsonResponse(poll));
            if (url.endsWith('/item/101')) return Promise.resolve(jsonResponse({ points: 5, content: 'A' }));
            if (url.endsWith('/item/102')) return Promise.resolve(jsonResponse({ points: 7, content: 'B' }));
            if (url.endsWith('/item/103')) return Promise.resolve(jsonResponse({ points: 1, content: 'C' }));
            return Promise.reject(new Error(`unexpected url ${url}`));
        });

        const result = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenCalledTimes(4);
        expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
            `${BASE_URL}/item/100`,
            `${BASE_URL}/item/101`,
            `${BASE_URL}/item/102`,
            `${BASE_URL}/item/103`,
        ]);
        expect(result.poll).toEqual([
            { points: 5, content: 'A' },
            { points: 7, content: 'B' },
            { points: 1, content: 'C' },
        ]);
        expect(result.poll_votes_count).toBe(13);
    });

    it('propagates fetch failures', async () => {
        fetchMock.mockRejectedValueOnce(new Error('network down'));
        await expect(fetchFeed('ask', 1)).rejects.toThrow('network down');
    });
});
