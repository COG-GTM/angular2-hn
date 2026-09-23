import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Story } from '../models';
import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hackerNewsApi';

function mockFetch(responder: (url: string) => unknown) {
    const spy = vi.fn((url: string) => Promise.resolve({ json: () => Promise.resolve(responder(url)) }));
    vi.stubGlobal('fetch', spy);
    return spy;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('hackerNewsApi', () => {
    it('requests the same feed endpoint and page as the Angular service', async () => {
        const spy = mockFetch(() => [{ id: 1 }]);

        await expect(fetchFeed('news', 2)).resolves.toEqual([{ id: 1 }]);
        expect(spy.mock.calls[0][0]).toBe(`${BASE_URL}/news?page=2`);
    });

    it('requests the user endpoint', async () => {
        const spy = mockFetch(() => ({ id: 'pg' }));

        await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg' });
        expect(spy.mock.calls[0][0]).toBe(`${BASE_URL}/user/pg`);
    });

    it('returns a story untouched when it is not a poll', async () => {
        mockFetch(() => ({ id: 10, type: 'story' }));

        await expect(fetchItemContent(10)).resolves.toEqual({ id: 10, type: 'story' });
    });

    it('resolves poll options from consecutive ids and totals the votes', async () => {
        mockFetch((url) => {
            if (url === `${BASE_URL}/item/100`) {
                return { id: 100, type: 'poll', poll: [{}, {}] };
            }
            const id = Number(url.split('/').pop());
            return { points: id - 100, content: `option ${id - 100}` };
        });

        const story = (await fetchItemContent(100)) as Story;

        expect(story.poll).toEqual([
            { points: 1, content: 'option 1' },
            { points: 2, content: 'option 2' },
        ]);
        expect(story.poll_votes_count).toBe(3);
    });
});
