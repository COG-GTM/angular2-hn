import { fetchFeed, fetchItemContent, fetchUser } from '../services/hackernews-api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HackerNews API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('fetchFeed', () => {
    it('should fetch feed data correctly', async () => {
      const mockData = [{ id: 1, title: 'Test Story' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchFeed('news', 1);
      expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1');
      expect(result).toEqual(mockData);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(fetchFeed('news', 1)).rejects.toThrow('Failed to fetch news feed');
    });
  });

  describe('fetchItemContent', () => {
    it('should fetch item content correctly', async () => {
      const mockData = { id: 1, title: 'Test', type: 'story' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchItemContent(1);
      expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/1');
      expect(result).toEqual(mockData);
    });

    it('should fetch poll options for poll type', async () => {
      const mockStory = {
        id: 100,
        title: 'Poll',
        type: 'poll',
        poll: [{}, {}],
      };
      const mockPoll1 = { points: 10, content: 'Option 1' };
      const mockPoll2 = { points: 20, content: 'Option 2' };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStory),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPoll1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPoll2),
        });

      const result = await fetchItemContent(100);
      expect(result.poll_votes_count).toBe(30);
      expect(result.poll[0]).toEqual(mockPoll1);
      expect(result.poll[1]).toEqual(mockPoll2);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(fetchItemContent(1)).rejects.toThrow('Failed to fetch item');
    });
  });

  describe('fetchUser', () => {
    it('should fetch user data correctly', async () => {
      const mockData = { id: 'testuser', karma: 100 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchUser('testuser');
      expect(mockFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/testuser');
      expect(result).toEqual(mockData);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(fetchUser('testuser')).rejects.toThrow('Failed to fetch user testuser');
    });
  });
});
