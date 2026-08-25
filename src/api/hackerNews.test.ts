import { afterEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackerNews';

function mockFetch(responses: Record<string, unknown>) {
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
        const key = String(url);
        if (!(key in responses)) {
            throw new Error(`Unexpected request: ${key}`);
        }
        return { ok: true, status: 200, json: async () => responses[key] } as Response;
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hackerNews api', () => {
    it('requests a feed page from the HN api', async () => {
        const fetchMock = mockFetch({ [`${BASE_URL}/news?page=2`]: [{ id: 1 }] });

        await expect(fetchFeed('news', 2)).resolves.toEqual([{ id: 1 }]);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
    });

    it('requests a user by id', async () => {
        mockFetch({ [`${BASE_URL}/user/pg`]: { id: 'pg', karma: 1 } });

        await expect(fetchUser('pg')).resolves.toMatchObject({ id: 'pg' });
    });

    it('rejects on a failed response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }) as Response)
        );

        await expect(fetchFeed('news', 1)).rejects.toThrow('status 500');
    });

    it('resolves poll options and sums up the votes', async () => {
        mockFetch({
            [`${BASE_URL}/item/100`]: {
                id: 100,
                type: 'poll',
                poll: [{ points: 0, content: '' }, { points: 0, content: '' }],
            },
            [`${BASE_URL}/item/101`]: { points: 3, content: 'first' },
            [`${BASE_URL}/item/102`]: { points: 7, content: 'second' },
        });

        const story = await fetchItemContent(100);

        expect(story.poll).toEqual([
            { points: 3, content: 'first' },
            { points: 7, content: 'second' },
        ]);
        expect(story.poll_votes_count).toBe(10);
    });

    it('leaves non-poll items untouched', async () => {
        const fetchMock = mockFetch({ [`${BASE_URL}/item/5`]: { id: 5, type: 'story' } });

        await expect(fetchItemContent(5)).resolves.toEqual({ id: 5, type: 'story' });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('passes the abort signal through to fetch', async () => {
        const fetchMock = mockFetch({ [`${BASE_URL}/news?page=1`]: [] });
        const controller = new AbortController();

        await fetchFeed('news', 1, controller.signal);

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=1`, { signal: controller.signal });
    });
});
