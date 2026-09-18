import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BASE_URL, fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews';

const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

function jsonResponse(data: unknown) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('hackernews api', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('fetches a feed page', async () => {
    fetchMock.mockResolvedValue(jsonResponse([{ id: 1 }]));

    const stories = await fetchFeed('news', 2);

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, { signal: undefined });
    expect(stories).toEqual([{ id: 1 }]);
  });

  it('fetches a user', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'pg' }));

    await expect(fetchUser('pg')).resolves.toEqual({ id: 'pg' });
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`, { signal: undefined });
  });

  it('fetches a poll option', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ points: 5, content: 'a' }));

    await expect(fetchPollContent(11)).resolves.toEqual({ points: 5, content: 'a' });
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/11`, { signal: undefined });
  });

  it('fetches a story without touching poll endpoints', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 3, type: 'story' }));

    const story = await fetchItemContent(3);

    expect(story).toEqual({ id: 3, type: 'story' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('resolves poll options and sums the vote count', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ id: 100, type: 'poll', poll: [{ points: 0, content: '' }, { points: 0, content: '' }] }),
      )
      .mockResolvedValueOnce(jsonResponse({ points: 10, content: 'option one' }))
      .mockResolvedValueOnce(jsonResponse({ points: 7, content: 'option two' }));

    const story = await fetchItemContent(100);

    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      `${BASE_URL}/item/100`,
      `${BASE_URL}/item/101`,
      `${BASE_URL}/item/102`,
    ]);
    expect(story.poll).toEqual([
      { points: 10, content: 'option one' },
      { points: 7, content: 'option two' },
    ]);
    expect(story.poll_votes_count).toBe(17);
  });

  it('throws on a non-ok response', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) } as Response);

    await expect(fetchFeed('news', 1)).rejects.toThrow('Request failed with status 500');
  });

  it('forwards the abort signal and propagates cancellation', async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });

    const pending = fetchFeed('news', 1, controller.signal);
    controller.abort();

    await expect(pending).rejects.toThrow('Aborted');
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=1`, { signal: controller.signal });
  });
});
