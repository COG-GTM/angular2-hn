import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed, fetchItemContent } from './hackernews-api';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
    return {
        ok,
        status,
        json: () => Promise.resolve(body),
    } as Response;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('fetchItemContent', () => {
    it('aggregates poll options and votes before resolving', async () => {
        const story = {
            id: 100,
            type: 'poll',
            poll: [
                { points: 0, content: '' },
                { points: 0, content: '' },
            ],
        };
        const fetchMock = vi.fn((input: string) => {
            if (input.endsWith('/item/100')) {
                return Promise.resolve(jsonResponse(story));
            }
            if (input.endsWith('/item/101')) {
                return Promise.resolve(jsonResponse({ points: 5, content: 'first' }));
            }
            if (input.endsWith('/item/102')) {
                return Promise.resolve(jsonResponse({ points: 7, content: 'second' }));
            }
            throw new Error(`unexpected url ${input}`);
        });
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchItemContent(100);

        expect(result.poll_votes_count).toBe(12);
        expect(result.poll).toEqual([
            { points: 5, content: 'first' },
            { points: 7, content: 'second' },
        ]);
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('leaves non-poll stories untouched', async () => {
        const fetchMock = vi.fn(() =>
            Promise.resolve(jsonResponse({ id: 1, type: 'link', title: 'hello' }))
        );
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchItemContent(1);

        expect(result.poll_votes_count).toBeUndefined();
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});

describe('fetchFeed', () => {
    it('throws on a non-ok response', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse(null, false, 500))));

        await expect(fetchFeed('news', 1)).rejects.toThrow('500');
    });

    it('passes the abort signal through', async () => {
        const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([])));
        vi.stubGlobal('fetch', fetchMock);
        const controller = new AbortController();

        await fetchFeed('news', 2, controller.signal);

        expect(fetchMock).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/news?page=2',
            { signal: controller.signal }
        );
    });
});
