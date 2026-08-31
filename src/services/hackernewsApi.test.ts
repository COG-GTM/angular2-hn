import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed, fetchItemContent } from './hackernewsApi';

function mockFetch(handler: (url: string) => unknown) {
    return vi.fn((url: string) =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(handler(url)) } as Response)
    );
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('fetchFeed', () => {
    it('requests the feed for the given page', async () => {
        const fetchMock = mockFetch(() => [{ id: 1 }]);
        vi.stubGlobal('fetch', fetchMock);

        const stories = await fetchFeed('news', 2);

        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2');
        expect(stories).toHaveLength(1);
    });

    it('rejects on a failed response', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 } as Response)));

        await expect(fetchFeed('news', 1)).rejects.toThrow(/status 500/);
    });
});

describe('fetchItemContent', () => {
    it('aggregates poll options and total votes', async () => {
        const fetchMock = mockFetch(url => {
            if (url.endsWith('/item/100')) {
                return { id: 100, type: 'poll', poll: [{}, {}] };
            }
            return { points: url.endsWith('/item/101') ? 3 : 7, content: url };
        });
        vi.stubGlobal('fetch', fetchMock);

        const story = await fetchItemContent(100);

        expect(story.poll.map(result => result.points)).toEqual([3, 7]);
        expect(story.poll_votes_count).toBe(10);
    });

    it('leaves non-poll stories untouched', async () => {
        vi.stubGlobal('fetch', mockFetch(() => ({ id: 5, type: 'story' })));

        const story = await fetchItemContent(5);

        expect(story.poll_votes_count).toBeUndefined();
    });
});
