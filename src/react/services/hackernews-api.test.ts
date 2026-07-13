import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed, fetchItemContent } from './hackernews-api';

function mockFetch(routes: Record<string, unknown>) {
    return vi.fn((url: string) => {
        const path = url.replace('https://node-hnapi.herokuapp.com', '');
        if (!(path in routes)) {
            return Promise.reject(new Error('Unexpected URL: ' + url));
        }
        return Promise.resolve({
            json: () => Promise.resolve(routes[path]),
        } as Response);
    });
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('fetchFeed', () => {
    it('requests the paginated feed endpoint and returns the stories', async () => {
        const stories = [{ id: 1 }, { id: 2 }];
        const fetchMock = mockFetch({ '/news?page=2': stories });
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchFeed('news', 2);

        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2', { signal: undefined });
        expect(result).toEqual(stories);
    });
});

describe('fetchItemContent poll aggregation', () => {
    it('fetches each poll option and sums the vote count', async () => {
        const fetchMock = mockFetch({
            '/item/100': {
                id: 100,
                type: 'poll',
                poll: [
                    { content: 'A', points: 0 },
                    { content: 'B', points: 0 },
                ],
            },
            '/item/101': { content: 'A', points: 10 },
            '/item/102': { content: 'B', points: 5 },
        });
        vi.stubGlobal('fetch', fetchMock);

        const story = await fetchItemContent(100);

        expect(story.poll_votes_count).toBe(15);
        expect(story.poll).toEqual([
            { content: 'A', points: 10 },
            { content: 'B', points: 5 },
        ]);
    });

    it('does not aggregate polls for regular stories', async () => {
        const fetchMock = mockFetch({
            '/item/7': { id: 7, type: 'story', title: 'hi' },
        });
        vi.stubGlobal('fetch', fetchMock);

        const story = await fetchItemContent(7);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(story.title).toBe('hi');
    });
});
