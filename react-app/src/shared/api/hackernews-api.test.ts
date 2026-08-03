import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews-api';

function jsonResponse(body: unknown, init?: { ok?: boolean; status?: number }) {
    return {
        ok: init?.ok ?? true,
        status: init?.status ?? 200,
        json: () => Promise.resolve(body),
    } as Response;
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
    it('requests the feed for a page and returns the stories', async () => {
        const stories = [{ id: 1, title: 'A story' }];
        fetchMock.mockResolvedValueOnce(jsonResponse(stories));

        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, undefined);
    });

    it('rejects when the response is not ok', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(null, { ok: false, status: 503 }));

        await expect(fetchFeed('jobs', 1)).rejects.toThrow('failed with status 503');
    });

    it('rejects when the network request fails', async () => {
        fetchMock.mockRejectedValueOnce(new Error('offline'));

        await expect(fetchFeed('news', 1)).rejects.toThrow('offline');
    });
});

describe('fetchItemContent', () => {
    it('returns a story unchanged when it is not a poll', async () => {
        const story = { id: 8863, type: 'story', title: 'My YC app' };
        fetchMock.mockResolvedValueOnce(jsonResponse(story));

        await expect(fetchItemContent(8863)).resolves.toEqual(story);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/8863`, undefined);
    });

    it('aggregates poll option votes into poll_votes_count', async () => {
        fetchMock
            .mockResolvedValueOnce(
                jsonResponse({
                    id: 100,
                    type: 'poll',
                    poll: [
                        { points: 0, content: '' },
                        { points: 0, content: '' },
                        { points: 0, content: '' },
                    ],
                })
            )
            .mockResolvedValueOnce(jsonResponse({ points: 5, content: 'Option A' }))
            .mockResolvedValueOnce(jsonResponse({ points: 7, content: 'Option B' }))
            .mockResolvedValueOnce(jsonResponse({ points: 3, content: 'Option C' }));

        const story = await fetchItemContent(100);

        expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
            `${BASE_URL}/item/100`,
            `${BASE_URL}/item/101`,
            `${BASE_URL}/item/102`,
            `${BASE_URL}/item/103`,
        ]);
        expect(story.poll).toEqual([
            { points: 5, content: 'Option A' },
            { points: 7, content: 'Option B' },
            { points: 3, content: 'Option C' },
        ]);
        expect(story.poll_votes_count).toBe(15);
    });

    it('leaves a poll without options alone', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ id: 100, type: 'poll', poll: [] }));

        const story = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(story.poll).toEqual([]);
    });

    it('rejects when a poll option request fails', async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ id: 100, type: 'poll', poll: [{ points: 0, content: '' }] }))
            .mockResolvedValueOnce(jsonResponse(null, { ok: false, status: 500 }));

        await expect(fetchItemContent(100)).rejects.toThrow('failed with status 500');
    });
});

describe('fetchPollContent', () => {
    it('requests a single poll option', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ points: 4, content: 'Option' }));

        await expect(fetchPollContent(101)).resolves.toEqual({ points: 4, content: 'Option' });
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/101`, undefined);
    });
});

describe('fetchUser', () => {
    it('requests a user by id', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'pg', karma: 155 }));

        await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg', karma: 155 });
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`, undefined);
    });

    it('rejects for an unknown user', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(null, { ok: false, status: 404 }));

        await expect(fetchUser('nobody')).rejects.toThrow('failed with status 404');
    });
});
