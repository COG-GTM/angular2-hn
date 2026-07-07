import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hnApi';

const BASE = 'https://node-hnapi.herokuapp.com';

function mockJson(value: unknown) {
  return Promise.resolve({ json: () => Promise.resolve(value) } as Response);
}

describe('hnApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetchFeed hits the feed endpoint with the page query', async () => {
    const feed = [{ id: 1, title: 'a' }];
    vi.mocked(fetch).mockReturnValueOnce(mockJson(feed));

    const result = await fetchFeed('news', 2);

    expect(fetch).toHaveBeenCalledWith(`${BASE}/news?page=2`, undefined);
    expect(result).toEqual(feed);
  });

  it('fetchUser hits the user endpoint', async () => {
    const user = { id: 'pg', karma: 100 };
    vi.mocked(fetch).mockReturnValueOnce(mockJson(user));

    const result = await fetchUser('pg');

    expect(fetch).toHaveBeenCalledWith(`${BASE}/user/pg`, undefined);
    expect(result).toEqual(user);
  });

  it('fetchPollContent hits the item endpoint', async () => {
    const poll = { points: 10, content: 'option' };
    vi.mocked(fetch).mockReturnValueOnce(mockJson(poll));

    const result = await fetchPollContent(123);

    expect(fetch).toHaveBeenCalledWith(`${BASE}/item/123`, undefined);
    expect(result).toEqual(poll);
  });

  it('fetchItemContent returns a plain story unchanged for non-poll types', async () => {
    const story = { id: 5, type: 'story', title: 'hi', poll: undefined };
    vi.mocked(fetch).mockReturnValueOnce(mockJson(story));

    const result = await fetchItemContent(5);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ id: 5, type: 'story' });
  });

  it('fetchItemContent expands poll options and accumulates poll_votes_count', async () => {
    const story = {
      id: 100,
      type: 'poll',
      title: 'best editor',
      poll: [{ points: 0, content: '' }, { points: 0, content: '' }],
    };
    // first call: the item itself
    vi.mocked(fetch).mockReturnValueOnce(mockJson(story));
    // then one call per poll option: id+1, id+2
    vi.mocked(fetch).mockReturnValueOnce(mockJson({ points: 30, content: 'vim' }));
    vi.mocked(fetch).mockReturnValueOnce(mockJson({ points: 12, content: 'emacs' }));

    const result = await fetchItemContent(100);

    expect(fetch).toHaveBeenNthCalledWith(1, `${BASE}/item/100`, undefined);
    expect(fetch).toHaveBeenNthCalledWith(2, `${BASE}/item/101`, undefined);
    expect(fetch).toHaveBeenNthCalledWith(3, `${BASE}/item/102`, undefined);
    expect(result.poll).toEqual([
      { points: 30, content: 'vim' },
      { points: 12, content: 'emacs' },
    ]);
    expect(result.poll_votes_count).toBe(42);
  });
});
