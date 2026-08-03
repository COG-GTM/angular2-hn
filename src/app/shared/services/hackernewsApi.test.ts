import { afterEach, describe, expect, it, vi } from 'vitest';

import { makeStory, makeUser } from '../../../test/fixtures';
import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernewsApi';

function mockFetch(responses: unknown[]) {
  const fetchMock = vi.fn();

  responses.forEach((body) => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => body } as Response);
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('hackernewsApi', () => {
  it('requests a feed page', async () => {
    const stories = [makeStory()];
    const fetchMock = mockFetch([stories]);

    await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
  });

  it('forwards the abort signal', async () => {
    const fetchMock = mockFetch([[]]);
    const controller = new AbortController();

    await fetchFeed('newest', 1, controller.signal);

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/newest?page=1`, { signal: controller.signal });
  });

  it('requests a single item', async () => {
    const story = makeStory({ id: 8863 });
    const fetchMock = mockFetch([story]);

    await expect(fetchItemContent(8863)).resolves.toEqual(story);
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/8863`, { signal: undefined });
  });

  it('resolves poll options and totals their votes', async () => {
    const poll = makeStory({
      id: 100,
      type: 'poll',
      poll: [
        { points: 0, content: 'placeholder a' },
        { points: 0, content: 'placeholder b' },
      ],
    });
    const fetchMock = mockFetch([
      poll,
      { points: 10, content: 'option a' },
      { points: 30, content: 'option b' },
    ]);

    const item = await fetchItemContent(100);

    expect(fetchMock).toHaveBeenNthCalledWith(2, `${BASE_URL}/item/101`, { signal: undefined });
    expect(fetchMock).toHaveBeenNthCalledWith(3, `${BASE_URL}/item/102`, { signal: undefined });
    expect(item.poll).toEqual([
      { points: 10, content: 'option a' },
      { points: 30, content: 'option b' },
    ]);
    expect(item.poll_votes_count).toBe(40);
  });

  it('leaves non-poll items untouched', async () => {
    const fetchMock = mockFetch([makeStory({ type: 'story' })]);

    const item = await fetchItemContent(1);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(item.poll_votes_count).toBeUndefined();
  });

  it('requests a poll option', async () => {
    const fetchMock = mockFetch([{ points: 5, content: 'option' }]);

    await expect(fetchPollContent(42)).resolves.toEqual({ points: 5, content: 'option' });
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/42`, { signal: undefined });
  });

  it('requests a user and escapes the id', async () => {
    const user = makeUser({ id: 'pg junior' });
    const fetchMock = mockFetch([user]);

    await expect(fetchUser('pg junior')).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg%20junior`, { signal: undefined });
  });

  it('rejects when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(fetchFeed('news', 1)).rejects.toThrow('offline');
  });

  it('rejects when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) } as Response));

    await expect(fetchUser('nobody')).rejects.toThrow('500');
  });
});
