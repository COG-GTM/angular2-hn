import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackerNewsApi';
import type { PollResult, Story } from '../types';

function jsonResponse(body: unknown, ok = true, status = 200) {
    return { ok, status, json: () => Promise.resolve(body) } as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('fetchFeed', () => {
    it('requests the feed page and returns the stories', async () => {
        const stories = [{ id: 1, title: 'A story' }];
        fetchMock.mockResolvedValue(jsonResponse(stories));

        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
    });

    it('rejects on a non-ok response', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}, false, 503));

        await expect(fetchFeed('news', 1)).rejects.toThrow('failed with status 503');
    });

    it('forwards the abort signal', async () => {
        fetchMock.mockResolvedValue(jsonResponse([]));
        const controller = new AbortController();

        await fetchFeed('ask', 1, controller.signal);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/ask?page=1`, { signal: controller.signal });
    });
});

describe('fetchUser', () => {
    it('requests the user and encodes the id', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 'pg' }));

        await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg' });
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`, { signal: undefined });

        await fetchUser('foo bar');
        expect(fetchMock).toHaveBeenLastCalledWith(`${BASE_URL}/user/foo%20bar`, { signal: undefined });
    });
});

describe('fetchPollContent', () => {
    it('requests a poll option by id', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ points: 4, content: 'Option' }));

        await expect(fetchPollContent(11)).resolves.toEqual({ points: 4, content: 'Option' });
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/11`, { signal: undefined });
    });
});

describe('fetchItemContent', () => {
    it('returns non-poll stories untouched', async () => {
        const story = { id: 10, type: 'story', title: 'A story' } as Story;
        fetchMock.mockResolvedValue(jsonResponse(story));

        await expect(fetchItemContent(10)).resolves.toEqual(story);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('replaces poll placeholders with the fetched options and totals their points', async () => {
        const poll = { id: 10, type: 'poll', poll: [{}, {}] } as unknown as Story;
        const optionOne: PollResult = { points: 30, content: 'One' };
        const optionTwo: PollResult = { points: 12, content: 'Two' };

        fetchMock
            .mockResolvedValueOnce(jsonResponse(poll))
            .mockResolvedValueOnce(jsonResponse(optionOne))
            .mockResolvedValueOnce(jsonResponse(optionTwo));

        const story = await fetchItemContent(10);

        expect(fetchMock).toHaveBeenNthCalledWith(2, `${BASE_URL}/item/11`, { signal: undefined });
        expect(fetchMock).toHaveBeenNthCalledWith(3, `${BASE_URL}/item/12`, { signal: undefined });
        expect(story.poll).toEqual([optionOne, optionTwo]);
        expect(story.poll_votes_count).toBe(42);
    });

    it('does not fetch options when a poll has none', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 10, type: 'poll' }));

        await fetchItemContent(10);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
