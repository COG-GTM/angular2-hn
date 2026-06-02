import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent, fetchUser } from './hackerNewsApi';

const baseUrl = 'https://node-hnapi.herokuapp.com';

function mockFetchOnce(data: unknown) {
  return vi.fn().mockResolvedValue({ json: () => Promise.resolve(data) });
}

describe('hackerNewsApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetchFeed requests the feed endpoint with the page query', async () => {
    const fetchMock = mockFetchOnce([{ id: 1 }]);
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchFeed('news', 2);

    expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/news?page=2`, { signal: undefined });
    expect(result).toEqual([{ id: 1 }]);
  });

  it('fetchUser requests the user endpoint', async () => {
    const fetchMock = mockFetchOnce({ id: 'pg', karma: 100 });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchUser('pg');

    expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/user/pg`, { signal: undefined });
    expect(result).toEqual({ id: 'pg', karma: 100 });
  });

  it('fetchItemContent aggregates poll vote counts', async () => {
    const story = {
      id: 100,
      type: 'poll',
      poll: [{}, {}],
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve(story) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ points: 10, content: 'A' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ points: 5, content: 'B' }) });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchItemContent(100);

    expect(fetchMock).toHaveBeenNthCalledWith(2, `${baseUrl}/item/101`, { signal: undefined });
    expect(fetchMock).toHaveBeenNthCalledWith(3, `${baseUrl}/item/102`, { signal: undefined });
    expect(result.poll_votes_count).toBe(15);
    expect(result.poll[0]).toEqual({ points: 10, content: 'A' });
    expect(result.poll[1]).toEqual({ points: 5, content: 'B' });
  });
});
