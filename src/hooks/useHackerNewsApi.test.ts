import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchFeed, fetchItemContent, fetchUser } from './useHackerNewsApi';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
    mockFetch.mockClear();
});

describe('fetchFeed', () => {
    it('fetches feed data from the API', async () => {
        const mockStories = [{ id: 1, title: 'Test Story' }];
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockStories),
        });

        const result = await fetchFeed('news', 1);
        expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1');
        expect(result).toEqual(mockStories);
    });

    it('throws on fetch error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Not Found',
        });

        await expect(fetchFeed('news', 999)).rejects.toThrow('Failed to fetch news feed');
    });
});

describe('fetchItemContent', () => {
    it('fetches item content from the API', async () => {
        const mockItem = { id: 1, title: 'Test', type: 'story', comments: [] };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockItem),
        });

        const result = await fetchItemContent(1);
        expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/1');
        expect(result).toEqual(mockItem);
    });
});

describe('fetchUser', () => {
    it('fetches user data from the API', async () => {
        const mockUser = { id: 'testuser', karma: 100 };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockUser),
        });

        const result = await fetchUser('testuser');
        expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/testuser');
        expect(result).toEqual(mockUser);
    });
});
