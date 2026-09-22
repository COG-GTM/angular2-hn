import { afterEach, describe, expect, it, vi } from 'vitest';

import { makeStory } from '../test/fixtures';
import { fetchFeed, fetchItemContent, fetchUser } from './hackerNewsApi';

function mockFetch(handler: (url: string) => unknown) {
  const spy = vi.fn((url: string) =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(handler(url)) } as Response)
  );
  vi.stubGlobal('fetch', spy);
  return spy;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('hackerNewsApi', () => {
  it('requests the paginated feed endpoint', async () => {
    const spy = mockFetch(() => [makeStory()]);
    const stories = await fetchFeed('news', 2);

    expect(spy.mock.calls[0][0]).toBe('https://node-hnapi.herokuapp.com/news?page=2');
    expect(stories).toHaveLength(1);
  });

  it('requests the user endpoint', async () => {
    const spy = mockFetch(() => ({ id: 'pg' }));
    await fetchUser('pg');

    expect(spy.mock.calls[0][0]).toBe('https://node-hnapi.herokuapp.com/user/pg');
  });

  it('throws on a non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, status: 404 } as Response))
    );

    await expect(fetchItemContent(7)).rejects.toThrow('failed with status 404');
  });

  it('resolves poll results and totals the votes', async () => {
    const poll = makeStory({
      id: 100,
      type: 'poll',
      poll: [
        { points: 0, content: 'a' },
        { points: 0, content: 'b' },
      ],
    });

    mockFetch((url) => {
      if (url.endsWith('/item/100')) {
        return poll;
      }
      return { points: url.endsWith('/item/101') ? 3 : 4, content: url };
    });

    const item = await fetchItemContent(100);

    expect(item.poll?.map((result) => result.points)).toEqual([3, 4]);
    expect(item.poll_votes_count).toBe(7);
  });
});
