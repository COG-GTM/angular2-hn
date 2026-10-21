import { fetchFeed, fetchItemContent, fetchUser, HN_API_BASE_URL } from './hackernews';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('hackernews api', () => {
  it('fetchFeed requests the feed page', async () => {
    fetchMock.mockResolvedValue(jsonResponse([{ id: 1 }]));
    await expect(fetchFeed('newest', 2)).resolves.toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/newest?page=2`, { signal: undefined });
  });

  it('rejects on non-2xx responses', async () => {
    fetchMock.mockResolvedValue(new Response('<pre>Cannot GET /user/pg</pre>', { status: 404 }));
    await expect(fetchUser('pg')).rejects.toThrow('HN API 404');
  });

  it('rejects on network errors', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchFeed('news', 1)).rejects.toThrow('Failed to fetch');
  });

  it('returns non-poll items unchanged', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 5, type: 'link', comments: [] }));
    await expect(fetchItemContent(5)).resolves.toEqual({ id: 5, type: 'link', comments: [] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('aggregates poll options from id+1..id+n', async () => {
    fetchMock.mockImplementation((url: string) => {
      const id = Number(url.split('/').pop());
      if (id === 100) {
        return Promise.resolve(
          jsonResponse({ id: 100, type: 'poll', poll: [{ item: 'a', points: 1 }, { item: 'b', points: 2 }] })
        );
      }
      return Promise.resolve(jsonResponse({ points: id === 101 ? 10 : 32, content: `opt ${id}` }));
    });

    const story = await fetchItemContent(100);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `${HN_API_BASE_URL}/item/100`,
      `${HN_API_BASE_URL}/item/101`,
      `${HN_API_BASE_URL}/item/102`,
    ]);
    expect(story.poll).toEqual([
      { points: 10, content: 'opt 101' },
      { points: 32, content: 'opt 102' },
    ]);
    expect(story.poll_votes_count).toBe(42);
  });

  it('keeps embedded data for poll options that fail and does not count them', async () => {
    fetchMock.mockImplementation((url: string) => {
      const id = Number(url.split('/').pop());
      if (id === 100) {
        return Promise.resolve(
          jsonResponse({ id: 100, type: 'poll', poll: [{ item: 'a', points: 1 }, { item: 'b', points: 2 }] })
        );
      }
      return id === 101 ? Promise.resolve(jsonResponse({ points: 7, content: 'A' })) : Promise.reject(new Error('x'));
    });

    const story = await fetchItemContent(100);

    expect(story.poll).toEqual([
      { points: 7, content: 'A' },
      { points: 2, content: 'b' },
    ]);
    expect(story.poll_votes_count).toBe(7);
  });

  it('passes the abort signal through', async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValue(jsonResponse([]));
    await fetchFeed('ask', 1, controller.signal);
    expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/ask?page=1`, { signal: controller.signal });
  });
});
