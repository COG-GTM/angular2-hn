import { PollResult, Story } from '../models';
import {
    HN_API_BASE_URL,
    fetchFeed,
    fetchItemContent,
    fetchPollContent,
    fetchUser,
    isAbortError,
} from './hackernews-api';

function jsonResponse(data: unknown): Response {
    return { ok: true, status: 200, json: async () => data } as Response;
}

const fetchMock = jest.fn<Promise<Response>, [string, RequestInit | undefined]>();

beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
});

describe('hackernews-api', () => {
    it('requests the feed url with the feed type and page', async () => {
        const stories = [{ id: 1, title: 'A story' }] as Story[];
        fetchMock.mockResolvedValueOnce(jsonResponse(stories));

        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
        expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/news?page=2`, { signal: undefined });
    });

    it('requests the user url', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'pg' }));

        await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg' });
        expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/user/pg`, { signal: undefined });
    });

    it('requests the poll option url', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ points: 3, content: 'Option' }));

        await expect(fetchPollContent(42)).resolves.toEqual({ points: 3, content: 'Option' });
        expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/item/42`, { signal: undefined });
    });

    it('passes the abort signal through to fetch', async () => {
        const controller = new AbortController();
        fetchMock.mockResolvedValueOnce(jsonResponse([]));

        await fetchFeed('news', 1, controller.signal);
        expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/news?page=1`, { signal: controller.signal });
    });

    it('rejects when the response is not ok', async () => {
        fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) } as Response);

        await expect(fetchItemContent(1)).rejects.toThrow('failed with status 500');
    });

    it('identifies abort errors', () => {
        const abortError = new DOMException('Aborted', 'AbortError');

        expect(isAbortError(abortError)).toBe(true);
        expect(isAbortError(new Error('boom'))).toBe(false);
        expect(isAbortError('boom')).toBe(false);
    });

    it('returns a non-poll item untouched', async () => {
        const story = { id: 7, type: 'story', title: 'Hello' } as Story;
        fetchMock.mockResolvedValueOnce(jsonResponse(story));

        await expect(fetchItemContent(7)).resolves.toEqual(story);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('resolves every poll option in order and tallies the votes', async () => {
        const poll = { id: 100, type: 'poll', poll: [{}, {}, {}] } as unknown as Story;
        const options: PollResult[] = [
            { points: 5, content: 'first' },
            { points: 10, content: 'second' },
            { points: 2, content: 'third' },
        ];
        fetchMock.mockResolvedValueOnce(jsonResponse(poll));
        fetchMock.mockImplementation(async (url) => {
            const id = Number(url.slice(url.lastIndexOf('/') + 1));
            return jsonResponse(options[id - 101]);
        });

        const story = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenCalledTimes(4);
        expect(fetchMock).toHaveBeenNthCalledWith(2, `${HN_API_BASE_URL}/item/101`, { signal: undefined });
        expect(fetchMock).toHaveBeenNthCalledWith(3, `${HN_API_BASE_URL}/item/102`, { signal: undefined });
        expect(fetchMock).toHaveBeenNthCalledWith(4, `${HN_API_BASE_URL}/item/103`, { signal: undefined });
        expect(story.poll).toEqual(options);
        expect(story.poll_votes_count).toBe(17);
    });

    it('passes the abort signal to poll sub-requests', async () => {
        const controller = new AbortController();
        const poll = { id: 200, type: 'poll', poll: [{}] } as unknown as Story;
        fetchMock.mockResolvedValueOnce(jsonResponse(poll));
        fetchMock.mockResolvedValueOnce(jsonResponse({ points: 1, content: 'only' }));

        await fetchItemContent(200, controller.signal);

        expect(fetchMock).toHaveBeenNthCalledWith(2, `${HN_API_BASE_URL}/item/201`, { signal: controller.signal });
    });
});
