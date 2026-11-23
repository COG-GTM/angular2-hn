import { fetchFeed, fetchItemContent, fetchUser, HN_API_URL, HNPWA_API_URL } from './hn';

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

  it('loads poll options and totals the votes', async () => {
    mockFetch({
      [`${HN_API_URL}/item/10`]: { id: 10, type: 'poll', poll: [{}, {}] },
      [`${HN_API_URL}/item/11`]: { points: 3, content: 'a' },
      [`${HN_API_URL}/item/12`]: { points: 7, content: 'b' },
    });
    const item = await fetchItemContent(10);
    expect(item.poll).toEqual([{ points: 3, content: 'a' }, { points: 7, content: 'b' }]);
    expect(item.poll_votes_count).toBe(10);
  });

  it('keeps the story when a poll option fails, like Angular', async () => {
    mockFetch({
      [`${HN_API_URL}/item/10`]: { id: 10, type: 'poll', poll: [{ points: 0, content: 'feed a' }, { points: 0, content: 'feed b' }] },
      [`${HN_API_URL}/item/12`]: { points: 7, content: 'b' },
    });
    const item = await fetchItemContent(10);
    expect(item.poll).toEqual([{ points: 0, content: 'feed a' }, { points: 7, content: 'b' }]);
    expect(item.poll_votes_count).toBe(7);
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
});
