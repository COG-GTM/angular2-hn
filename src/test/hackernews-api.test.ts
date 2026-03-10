import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchFeed, fetchItemContent, fetchUser } from '../services/hackernews-api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
    mockFetch.mockReset();
});

describe('fetchFeed', () => {
    it('fetches feed data from the API', async () => {
        const mockStories = [{ id: 1, title: 'Test Story' }];
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockStories),
        });

        const result = await fetchFeed('news', 1);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/news?page=1'
        );
        expect(result).toEqual(mockStories);
    });
});

describe('fetchItemContent', () => {
    it('fetches item content from the API', async () => {
        const mockStory = { id: 1, title: 'Test', type: 'story' };
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockStory),
        });

        const result = await fetchItemContent(1);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/item/1'
        );
        expect(result).toEqual(mockStory);
    });
});

describe('fetchUser', () => {
    it('fetches user data from the API', async () => {
        const mockUser = { id: 'testuser', karma: 100 };
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockUser),
        });

        const result = await fetchUser('testuser');
        expect(mockFetch).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/user/testuser'
        );
        expect(result).toEqual(mockUser);
    });
});
