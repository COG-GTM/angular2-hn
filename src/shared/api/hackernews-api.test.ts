import { HN_API_BASE_URL, HttpError, fetchFeed, fetchItemContent, fetchUser } from './hackernews-api';

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
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

    it('fetchFeed hits /<feedType>?page=<page> and forwards the AbortSignal', async () => {
        const stories = [{ id: 1, title: 'Hello' }];
        fetchMock.mockResolvedValueOnce(jsonResponse(stories));
        const controller = new AbortController();

        await expect(fetchFeed('news', 2, controller.signal)).resolves.toEqual(stories);

        expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/news?page=2`, { signal: controller.signal });
    });

    it('throws HttpError on non-2xx responses', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'nope' }, 500));

        await expect(fetchUser('pg')).rejects.toBeInstanceOf(HttpError);
    });

    it('fetchItemContent returns a plain story untouched', async () => {
        const story = { id: 10, type: 'story', title: 'Story', comments: [] };
        fetchMock.mockResolvedValueOnce(jsonResponse(story));

        await expect(fetchItemContent(10)).resolves.toEqual(story);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('fetchItemContent resolves every poll option in parallel and sums the votes', async () => {
        const poll = { id: 100, type: 'poll', title: 'Poll', comments: [], poll: [{}, {}, {}] };
        fetchMock.mockImplementation(async (input) => {
            const url = String(input);
            if (url.endsWith('/item/100')) return jsonResponse(poll);
            if (url.endsWith('/item/101')) return jsonResponse({ points: 5, content: 'A' });
            if (url.endsWith('/item/102')) return jsonResponse({ points: 7, content: 'B' });
            if (url.endsWith('/item/103')) return jsonResponse({ points: 0, content: 'C' });
            throw new Error(`unexpected url ${url}`);
        });

        const result = await fetchItemContent(100);

        expect(result.poll).toEqual([
            { points: 5, content: 'A' },
            { points: 7, content: 'B' },
            { points: 0, content: 'C' },
        ]);
        expect(result.poll_votes_count).toBe(12);
        expect(result.poll_incomplete).toBeUndefined();
        expect(fetchMock).toHaveBeenCalledTimes(4);
    });

    it('fetchItemContent keeps the story when a single poll option request fails', async () => {
        const poll = {
            id: 100,
            type: 'poll',
            title: 'Poll',
            comments: [{ id: 200 }],
            poll: [{ content: 'A (from story)' }, { content: 'B (from story)' }],
        };
        fetchMock.mockImplementation(async (input) => {
            const url = String(input);
            if (url.endsWith('/item/100')) return jsonResponse(poll);
            if (url.endsWith('/item/101')) return jsonResponse({ points: 5, content: 'A' });
            if (url.endsWith('/item/102')) return jsonResponse({ error: 'gone' }, 404);
            throw new Error(`unexpected url ${url}`);
        });

        const result = await fetchItemContent(100);

        expect(result.comments).toEqual([{ id: 200 }]);
        expect(result.poll).toEqual([{ points: 5, content: 'A' }, { content: 'B (from story)' }]);
        expect(result.poll_votes_count).toBe(5);
        expect(result.poll_incomplete).toBe(true);
    });

    it('fetchUser encodes the id', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'a b' }));

        await fetchUser('a b');

        expect(fetchMock.mock.calls[0][0]).toBe(`${HN_API_BASE_URL}/user/a%20b`);
    });
});
