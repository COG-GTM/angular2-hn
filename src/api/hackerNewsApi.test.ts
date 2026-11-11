import { describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent, fetchPollContent, fetchUser, HN_API_BASE_URL } from './hackerNewsApi';

function mockFetch(...bodies: unknown[]) {
  return vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve({
    ok: true, json: () => Promise.resolve(bodies.shift()),
  })));
}
describe('HN API', () => {
  it('uses feed, item, poll and encoded user URLs and forwards signals', async () => {
    mockFetch([], { type: 'story' }, { points: 2 }, { id: 'a/b' });
    const signal = new AbortController().signal;
    expect(await fetchFeed('news', 2, signal)).toEqual([]);
    await fetchItemContent(12, signal);
    await fetchPollContent(13, signal);
    await fetchUser('a/b', signal);
    expect(vi.mocked(fetch).mock.calls).toEqual([
      [HN_API_BASE_URL + '/news?page=2', { signal }],
      [HN_API_BASE_URL + '/item/12', { signal }],
      [HN_API_BASE_URL + '/item/13', { signal }],
      [HN_API_BASE_URL + '/user/a%2Fb', { signal }],
    ]);
  });
  it('awaits all poll options and totals their points', async () => {
    mockFetch({ id: 10, type: 'poll', poll: [{}, {}] }, { points: 3 }, { points: 7 });
    const signal = new AbortController().signal;
    expect(await fetchItemContent(10, signal)).toMatchObject({ poll: [{ points: 3 }, { points: 7 }], poll_votes_count: 10 });
    expect(fetch).toHaveBeenNthCalledWith(2, HN_API_BASE_URL + '/item/11', { signal });
    expect(fetch).toHaveBeenNthCalledWith(3, HN_API_BASE_URL + '/item/12', { signal });
  });
  it('handles empty polls', async () => {
    mockFetch({ id: 1, type: 'poll', poll: [] });
    expect(await fetchItemContent(1)).toMatchObject({ poll: [], poll_votes_count: 0 });
  });
  it('rejects HTTP errors, including poll option errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, statusText: 'Unavailable' }));
    await expect(fetchFeed('ask', 1)).rejects.toThrow('503 Unavailable');
    mockFetch({ id: 1, type: 'poll', poll: [{}] });
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, type: 'poll', poll: [{}] }) } as Response)
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Error' } as Response);
    await expect(fetchItemContent(1)).rejects.toThrow('500 Error');
  });
  it('propagates transport and cancellation errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')));
    await expect(fetchUser('a')).rejects.toMatchObject({ name: 'AbortError' });
  });
});
