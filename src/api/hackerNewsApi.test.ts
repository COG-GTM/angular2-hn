import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackerNewsApi';
import type { Story } from '../models';

function jsonResponse(data: unknown) {
    return Promise.resolve({ json: () => Promise.resolve(data) } as Response);
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
    it('requests the feed for the given type and page', async () => {
        const stories = [{ id: 1, title: 'A story' }];
        fetchMock.mockReturnValue(jsonResponse(stories));

        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`);
    });

    it('rejects when the request fails', async () => {
        fetchMock.mockRejectedValue(new Error('offline'));

        await expect(fetchFeed('ask', 1)).rejects.toThrow('offline');
    });
});

describe('fetchUser', () => {
    it('requests the user by id', async () => {
        const user = { id: 'pg', karma: 100 };
        fetchMock.mockReturnValue(jsonResponse(user));

        await expect(fetchUser('pg')).resolves.toEqual(user);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`);
    });
});

describe('fetchPollContent', () => {
    it('requests a poll option by id', async () => {
        const pollResult = { points: 12, content: 'Option' };
        fetchMock.mockReturnValue(jsonResponse(pollResult));

        await expect(fetchPollContent(101)).resolves.toEqual(pollResult);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/101`);
    });
});

describe('fetchItemContent', () => {
    it('requests an item by id', async () => {
        const story = { id: 7, type: 'story', title: 'Story' };
        fetchMock.mockReturnValue(jsonResponse(story));

        await expect(fetchItemContent(7)).resolves.toEqual(story);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/7`);
    });

    it('resolves poll options and sums the total vote count', async () => {
        const poll = {
            id: 100,
            type: 'poll',
            poll: [{}, {}],
        } as unknown as Story;

        fetchMock.mockImplementation((url: string) => {
            if (url === `${BASE_URL}/item/100`) {
                return jsonResponse(poll);
            }
            if (url === `${BASE_URL}/item/101`) {
                return jsonResponse({ points: 10, content: 'First option' });
            }
            if (url === `${BASE_URL}/item/102`) {
                return jsonResponse({ points: 5, content: 'Second option' });
            }
            throw new Error(`unexpected url ${url}`);
        });

        const result = await fetchItemContent(100);

        expect(result.poll).toEqual([
            { points: 10, content: 'First option' },
            { points: 5, content: 'Second option' },
        ]);
        expect(result.poll_votes_count).toBe(15);
    });
});
