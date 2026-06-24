import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent, fetchUser } from './hackernews-api';

function mockFetchSequence(...payloads: unknown[]) {
  const fetchMock = vi.fn();
  for (const payload of payloads) {
    fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve(payload) } as Response);
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('hackernews-api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a feed for a given type and page', async () => {
    const stories = [{ id: 1, title: 'Story' }];
    const fetchMock = mockFetchSequence(stories);

    const result = await fetchFeed('news', 2);

    expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2');
    expect(result).toEqual(stories);
  });

  it('fetches a user by id', async () => {
    const user = { id: 'pg', karma: 100 };
    const fetchMock = mockFetchSequence(user);

    const result = await fetchUser('pg');

    expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/pg');
    expect(result).toEqual(user);
  });

  it('resolves poll options and aggregates vote counts for poll items', async () => {
    const poll = {
      id: 10,
      type: 'poll',
      poll: [{}, {}],
    };
    mockFetchSequence(
      poll,
      { points: 3, content: 'Option A' },
      { points: 7, content: 'Option B' },
    );

    const result = await fetchItemContent(10);

    expect(result.poll_votes_count).toBe(10);
    expect(result.poll[0]).toEqual({ points: 3, content: 'Option A' });
    expect(result.poll[1]).toEqual({ points: 7, content: 'Option B' });
  });

  it('does not fetch poll options for non-poll items', async () => {
    const story = { id: 5, type: 'story', title: 'Hello' };
    const fetchMock = mockFetchSequence(story);

    const result = await fetchItemContent(5);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.title).toBe('Hello');
  });
});
