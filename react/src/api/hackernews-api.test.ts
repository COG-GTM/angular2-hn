import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews-api';
import type { Story } from '../models';

function mockResponse(data: unknown, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(data) } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchFeed', () => {
  it('constructs the feed URL from feedType and page', async () => {
    const stories = [{ id: 1 }, { id: 2 }];
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(stories));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchFeed('news', 2);

    expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2');
    expect(result).toEqual(stories);
  });

  it('throws on non-OK responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(null, false, 500)));

    await expect(fetchFeed('news', 1)).rejects.toThrow('failed with status 500');
  });
});

describe('fetchItemContent', () => {
  it('returns non-poll stories without extra fetches', async () => {
    const story = { id: 42, type: 'story' };
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(story));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchItemContent(42);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/42');
    expect(result).toEqual(story);
  });

  it('resolves poll options and aggregates poll_votes_count', async () => {
    const story = {
      id: 100,
      type: 'poll',
      poll: [{}, {}],
      poll_votes_count: 0,
    } as unknown as Story;
    const optionA = { points: 3, content: 'A' };
    const optionB = { points: 7, content: 'B' };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse(story))
      .mockResolvedValueOnce(mockResponse(optionA))
      .mockResolvedValueOnce(mockResponse(optionB));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchItemContent(100);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://node-hnapi.herokuapp.com/item/101');
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'https://node-hnapi.herokuapp.com/item/102');
    expect(result.poll).toEqual([optionA, optionB]);
    expect(result.poll_votes_count).toBe(10);
  });
});

describe('fetchPollContent', () => {
  it('fetches the item URL for the poll option', async () => {
    const option = { points: 5, content: 'Option' };
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(option));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchPollContent(7);

    expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/7');
    expect(result).toEqual(option);
  });
});

describe('fetchUser', () => {
  it('fetches the user URL', async () => {
    const user = { id: 'pg', karma: 1000 };
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(user));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchUser('pg');

    expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/pg');
    expect(result).toEqual(user);
  });
});
