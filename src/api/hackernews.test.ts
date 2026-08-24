import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed, fetchItemContent, fetchUser } from './hackernews';
import { Story } from '../models/story';

function mockFetchResponses(responses: Record<string, unknown>) {
  return vi.fn(async (url: string) => {
    const body = responses[url];
    if (body === undefined) {
      return { ok: false, status: 404, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => body };
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchFeed', () => {
  it('fetches a page of stories', async () => {
    const stories = [{ id: 1, title: 'Hello' }];
    vi.stubGlobal('fetch', mockFetchResponses({ 'https://node-hnapi.herokuapp.com/news?page=2': stories }));

    await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
  });

  it('rejects on a non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetchResponses({}));

    await expect(fetchFeed('news', 1)).rejects.toThrow('404');
  });
});

describe('fetchItemContent', () => {
  it('returns a plain story unchanged', async () => {
    const story = { id: 10, type: 'story', title: 'A story' };
    vi.stubGlobal('fetch', mockFetchResponses({ 'https://node-hnapi.herokuapp.com/item/10': story }));

    await expect(fetchItemContent(10)).resolves.toEqual(story);
  });

  it('populates poll options and total votes for polls', async () => {
    const poll = { id: 100, type: 'poll', poll: [{}, {}] };
    vi.stubGlobal(
      'fetch',
      mockFetchResponses({
        'https://node-hnapi.herokuapp.com/item/100': poll,
        'https://node-hnapi.herokuapp.com/item/101': { points: 3, content: 'Option A' },
        'https://node-hnapi.herokuapp.com/item/102': { points: 7, content: 'Option B' },
      })
    );

    const result: Story = await fetchItemContent(100);
    expect(result.poll).toEqual([
      { points: 3, content: 'Option A' },
      { points: 7, content: 'Option B' },
    ]);
    expect(result.poll_votes_count).toBe(10);
  });
});

describe('fetchUser', () => {
  it('fetches a user by id', async () => {
    const user = { id: 'pg', karma: 1000 };
    vi.stubGlobal('fetch', mockFetchResponses({ 'https://node-hnapi.herokuapp.com/user/pg': user }));

    await expect(fetchUser('pg')).resolves.toEqual(user);
  });
});
