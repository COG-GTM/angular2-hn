import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed, fetchItemContent, fetchUser } from './hackernewsApi';

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('hackernewsApi', () => {
  it('fetchFeed hits the feed endpoint with page', async () => {
    const spy = mockFetchOnce([{ id: 1 }]);
    const items = await fetchFeed('news', 2);
    expect(spy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2');
    expect(items).toHaveLength(1);
  });

  it('fetchUser hits the user endpoint', async () => {
    const spy = mockFetchOnce({ id: 'pg' });
    const user = await fetchUser('pg');
    expect(spy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/pg');
    expect(user.id).toBe('pg');
  });

  it('throws on non-OK responses', async () => {
    mockFetchOnce({}, false, 500);
    await expect(fetchUser('pg')).rejects.toThrow('500');
  });

  it('fetchItemContent aggregates poll votes', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    spy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 10, type: 'poll', poll: [{}, {}] }),
    } as Response);
    spy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ points: 3 }),
    } as Response);
    spy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ points: 4 }),
    } as Response);

    const item = await fetchItemContent(10);
    expect(item.poll_votes_count).toBe(7);
    expect(spy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/11');
    expect(spy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/12');
  });
});
