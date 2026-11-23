import { fetchFeed, fetchItemContent, fetchPollResults, fetchUser, HN_API_URL, HNPWA_API_URL, pollVotes } from './hn';

function mockFetch(responses: Record<string, unknown>) {
  const fn = vi.fn(async (url: string) => {
    if (!(url in responses)) return new Response('<pre>Cannot GET</pre>', { status: 404 });
    return new Response(JSON.stringify(responses[url]), { status: 200 });
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('hn api', () => {
  it('fetches a feed page from node-hnapi', async () => {
    const fn = mockFetch({ [`${HN_API_URL}/show?page=2`]: [{ id: 1 }] });
    await expect(fetchFeed('show', 2)).resolves.toEqual([{ id: 1 }]);
    expect(fn).toHaveBeenCalledWith(`${HN_API_URL}/show?page=2`, expect.anything());
  });

  it('fills poll options from the feed entry, then loads each option', async () => {
    mockFetch({
      [`${HN_API_URL}/item/10`]: { id: 10, type: 'poll', poll: [{ item: 'feed a', points: 2 }, { item: 'feed b', points: 6 }] },
      [`${HN_API_URL}/item/11`]: { points: 3, content: 'a' },
      [`${HN_API_URL}/item/12`]: { points: 7, content: 'b' },
    });
    const item = await fetchItemContent(10);
    expect(item.poll).toEqual([{ points: 2, content: 'feed a' }, { points: 6, content: 'feed b' }]);
    const poll = await fetchPollResults(item);
    expect(poll).toEqual([{ points: 3, content: 'a' }, { points: 7, content: 'b' }]);
    expect(pollVotes(poll)).toBe(10);
  });

  it('keeps the feed entry when a poll option fails, like Angular', async () => {
    mockFetch({
      [`${HN_API_URL}/item/10`]: { id: 10, type: 'poll', poll: [{ item: 'feed a', points: 2 }, { item: 'feed b', points: 6 }] },
      [`${HN_API_URL}/item/12`]: { points: 7, content: 'b' },
    });
    const poll = await fetchPollResults(await fetchItemContent(10));
    expect(poll).toEqual([{ points: 2, content: 'feed a' }, { points: 7, content: 'b' }]);
    expect(pollVotes(poll)).toBe(9);
  });

  it('fetches users from HNPWA', async () => {
    mockFetch({ [`${HNPWA_API_URL}/user/pg.json`]: { id: 'pg', karma: 1 } });
    await expect(fetchUser('pg')).resolves.toMatchObject({ id: 'pg' });
  });

  it('rejects on HTTP errors and non-JSON bodies', async () => {
    mockFetch({});
    await expect(fetchUser('nobody')).rejects.toThrow();
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>oops</html>', { status: 200 })));
    await expect(fetchFeed('news', 1)).rejects.toThrow();
  });

  it('rejects the 200 "not found" bodies of node-hnapi and HNPWA', async () => {
    mockFetch({ [`${HN_API_URL}/item/1`]: { error: 'Item 1 not found' }, [`${HNPWA_API_URL}/user/nobody.json`]: null });
    await expect(fetchItemContent(1)).rejects.toThrow();
    await expect(fetchUser('nobody')).rejects.toThrow();
  });
});
