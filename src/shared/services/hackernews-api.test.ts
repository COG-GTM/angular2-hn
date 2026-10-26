import { describe, expect, it, vi } from 'vitest';

import { jsonResponse, makeStory } from '../../test/fixtures';
import { BASE_URL, USER_FALLBACK_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews-api';

function mockFetch(handler: (url: string) => Response | Promise<Response>) {
    return vi.spyOn(globalThis, 'fetch').mockImplementation((input) => Promise.resolve(handler(String(input))));
}

describe('hackernews-api', () => {
    it('fetchFeed requests the feed page', async () => {
        const spy = mockFetch(() => jsonResponse([makeStory()]));
        const stories = await fetchFeed('news', 2);
        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, expect.anything());
        expect(stories).toHaveLength(1);
    });

    it('fetchItemContent fans out to every poll option and sums poll_votes_count', async () => {
        const poll = makeStory({ id: 10, type: 'poll', poll: [{}, {}, {}] as never });
        const spy = mockFetch((url) => {
            if (url.endsWith('/item/10')) return jsonResponse(poll);
            const id = Number(url.split('/').pop());
            return jsonResponse({ id, points: id * 10, content: `option ${id}` });
        });

        const story = await fetchItemContent(10);

        expect(spy).toHaveBeenCalledTimes(4);
        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/item/11`, expect.anything());
        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/item/13`, expect.anything());
        expect(story.poll.map((p) => p.content)).toEqual(['option 11', 'option 12', 'option 13']);
        expect(story.poll_votes_count).toBe(110 + 120 + 130);
    });

    it('fetchItemContent leaves non-poll items untouched', async () => {
        const spy = mockFetch(() => jsonResponse(makeStory({ id: 5 })));
        const story = await fetchItemContent(5);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(story.poll_votes_count).toBe(0);
    });

    it('fetchPollContent requests the poll option item', async () => {
        const spy = mockFetch(() => jsonResponse({ points: 7 }));
        await expect(fetchPollContent(3)).resolves.toEqual({ points: 7 });
        expect(spy).toHaveBeenCalledWith(`${BASE_URL}/item/3`, expect.anything());
    });

    it('fetchUser falls back to HNPWA when node-hnapi returns 404', async () => {
        const spy = mockFetch((url) =>
            url.startsWith(BASE_URL) ? jsonResponse({}, 404) : jsonResponse({ id: 'pg', karma: 1 })
        );
        await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg', karma: 1 });
        expect(spy).toHaveBeenLastCalledWith(`${USER_FALLBACK_URL}/user/pg.json`, expect.anything());
    });

    it('fetchUser rejects when the user does not exist', async () => {
        mockFetch((url) => (url.startsWith(BASE_URL) ? jsonResponse({}, 404) : jsonResponse(null)));
        await expect(fetchUser('nobody')).rejects.toThrow('User nobody not found');
    });

    it('propagates the AbortSignal so requests can be cancelled', async () => {
        const controller = new AbortController();
        const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(
            (_input, init) =>
                new Promise((_resolve, reject) =>
                    init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
                )
        );
        const pending = fetchFeed('news', 1, controller.signal);
        controller.abort();
        await expect(pending).rejects.toThrow('Aborted');
        expect(spy.mock.calls[0][1]?.signal).toBe(controller.signal);
    });
});
