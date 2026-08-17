import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackernewsApi';

function jsonResponse(data: unknown) {
    return { ok: true, json: () => Promise.resolve(data) } as Response;
}

describe('hackernewsApi', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('requests a feed page', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse([{ id: 1 }]));
        const stories = await fetchFeed('news', 2);
        expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
        expect(stories).toHaveLength(1);
    });

    it('requests a user', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 'pg' }));
        const user = await fetchUser('pg');
        expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/user/pg`, { signal: undefined });
        expect(user.id).toBe('pg');
    });

    it('accumulates poll option votes', async () => {
        vi.mocked(fetch).mockImplementation((input: RequestInfo | URL) => {
            const url = String(input);
            if (url === `${BASE_URL}/item/100`) {
                return Promise.resolve(
                    jsonResponse({
                        id: 100,
                        type: 'poll',
                        poll: [{ points: 0, content: '' }, { points: 0, content: '' }],
                    })
                );
            }
            if (url === `${BASE_URL}/item/101`) {
                return Promise.resolve(jsonResponse({ points: 3, content: 'first' }));
            }
            return Promise.resolve(jsonResponse({ points: 4, content: 'second' }));
        });

        const story = await fetchItemContent(100);

        expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/item/101`, { signal: undefined });
        expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/item/102`, { signal: undefined });
        expect(story.poll).toEqual([
            { points: 3, content: 'first' },
            { points: 4, content: 'second' },
        ]);
        expect(story.poll_votes_count).toBe(7);
    });

    it('throws when the request fails', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);
        await expect(fetchUser('nope')).rejects.toThrow('Request failed with status 500');
    });
});
