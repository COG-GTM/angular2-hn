import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews-api';
import { Story } from '../models';

describe('hackerNewsApi', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function response(data: unknown, ok = true, status = 200) {
        return {
            ok,
            status,
            json: vi.fn().mockResolvedValue(data),
        };
    }

    it('fetches a feed', async () => {
        fetchMock.mockResolvedValue(response([]));

        await fetchFeed('news', 2);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`);
    });

    it('fetches item content', async () => {
        const story = { id: 12, type: 'story' } as Story;
        fetchMock.mockResolvedValue(response(story));

        await fetchItemContent(12);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/12`);
    });

    it('fills poll results and sums poll votes', async () => {
        const story = { id: 100, type: 'poll', poll: [{}, {}] } as Story;
        const firstResult = { points: 3, content: 'first' };
        const secondResult = { points: 7, content: 'second' };
        fetchMock
            .mockResolvedValueOnce(response(story))
            .mockResolvedValueOnce(response(firstResult))
            .mockResolvedValueOnce(response(secondResult));

        const result = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenNthCalledWith(1, `${BASE_URL}/item/100`);
        expect(fetchMock).toHaveBeenNthCalledWith(2, `${BASE_URL}/item/101`);
        expect(fetchMock).toHaveBeenNthCalledWith(3, `${BASE_URL}/item/102`);
        expect(result.poll).toEqual([firstResult, secondResult]);
        expect(result.poll_votes_count).toBe(10);
    });

    it('does not fetch poll results for non-poll stories', async () => {
        const story = { id: 100, type: 'story' } as Story;
        fetchMock.mockResolvedValue(response(story));

        const result = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(story);
        expect('poll_votes_count' in result).toBe(false);
    });

    it('fetches poll content', async () => {
        fetchMock.mockResolvedValue(response({ points: 2, content: 'option' }));

        await fetchPollContent(101);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/101`);
    });

    it('fetches a user', async () => {
        fetchMock.mockResolvedValue(response({ id: 'pg' }));

        await fetchUser('pg');

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`);
    });

    it('rejects for a non-ok response', async () => {
        fetchMock.mockResolvedValue(response({}, false, 503));

        await expect(fetchFeed('news', 1)).rejects.toThrow('Request failed: 503');
    });

    it('rejects for a network error', async () => {
        fetchMock.mockRejectedValue(new Error('network error'));

        await expect(fetchUser('pg')).rejects.toThrow('network error');
    });
});
