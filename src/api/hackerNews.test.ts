import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackerNews';

function mockFetch(handler: (url: string) => unknown, ok = true, status = 200) {
    const fetchMock = vi.fn(async (url: string) => ({
        ok,
        status,
        json: async () => handler(url),
    }));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('fetchFeed', () => {
    it('requests the feed for the given type and page', async () => {
        const stories = [{ id: 1, title: 'A story' }];
        const fetchMock = mockFetch(() => stories);

        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, undefined);
    });

    it('rejects when the response is not ok', async () => {
        mockFetch(() => ({}), false, 500);

        await expect(fetchFeed('news', 1)).rejects.toThrow(/failed with status 500/);
    });
});

describe('fetchItemContent', () => {
    it('requests the item by id', async () => {
        const story = { id: 42, type: 'story', title: 'An item' };
        const fetchMock = mockFetch(() => story);

        await expect(fetchItemContent(42)).resolves.toEqual(story);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/42`, undefined);
    });

    it('fetches every poll option and sums the vote count', async () => {
        const fetchMock = mockFetch((url) => {
            if (url === `${BASE_URL}/item/100`) {
                return {
                    id: 100,
                    type: 'poll',
                    title: 'A poll',
                    poll: [
                        { points: 0, content: '' },
                        { points: 0, content: '' },
                        { points: 0, content: '' },
                    ],
                };
            }
            const optionId = Number(url.split('/').pop());
            return { points: optionId - 100, content: `option ${optionId - 100}` };
        });

        const story = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/101`, undefined);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/102`, undefined);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/103`, undefined);
        expect(story.poll).toEqual([
            { points: 1, content: 'option 1' },
            { points: 2, content: 'option 2' },
            { points: 3, content: 'option 3' },
        ]);
        expect(story.poll_votes_count).toBe(6);
    });

    it('leaves non-poll items untouched', async () => {
        const fetchMock = mockFetch(() => ({ id: 7, type: 'story', poll: undefined }));

        const story = await fetchItemContent(7);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(story.poll_votes_count).toBeUndefined();
    });
});

describe('fetchPollContent', () => {
    it('requests a single poll option', async () => {
        const fetchMock = mockFetch(() => ({ points: 3, content: 'option' }));

        await expect(fetchPollContent(5)).resolves.toEqual({ points: 3, content: 'option' });
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/5`, undefined);
    });
});

describe('fetchUser', () => {
    it('requests the user by id', async () => {
        const user = { id: 'pg', karma: 1000, created: 'a long time ago' };
        const fetchMock = mockFetch(() => user);

        await expect(fetchUser('pg')).resolves.toEqual(user);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`, undefined);
    });

    it('propagates network failures', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                throw new Error('network down');
            })
        );

        await expect(fetchUser('pg')).rejects.toThrow('network down');
    });
});
