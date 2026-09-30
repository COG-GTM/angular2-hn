import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL, hackerNewsApi } from './hackernews';

type Routes = Record<string, { status?: number; body: unknown }>;

function mockFetch(routes: Routes) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const path = String(input).replace(API_BASE_URL, '');
    const route = routes[path];
    if (!route) return new Response('not found', { status: 404 });
    return new Response(JSON.stringify(route.body), { status: route.status ?? 200 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('hackerNewsApi', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the node-hnapi base url', () => {
    expect(API_BASE_URL).toBe('https://node-hnapi.herokuapp.com');
  });

  it('fetchFeed requests /{feedType}?page=N and forwards the signal', async () => {
    const fetchMock = mockFetch({ '/newest?page=3': { body: [{ id: 1 }] } });
    const controller = new AbortController();
    await expect(hackerNewsApi.fetchFeed('newest', 3, controller.signal)).resolves.toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/newest?page=3`, { signal: controller.signal });
  });

  it('fetchUser requests /user/:id', async () => {
    mockFetch({ '/user/pg': { body: { id: 'pg', karma: 1 } } });
    await expect(hackerNewsApi.fetchUser('pg')).resolves.toEqual({ id: 'pg', karma: 1 });
  });

  it('fetchPollContent requests /item/:id', async () => {
    mockFetch({ '/item/5': { body: { points: 3, content: 'yes' } } });
    await expect(hackerNewsApi.fetchPollContent(5)).resolves.toEqual({ points: 3, content: 'yes' });
  });

  it('throws on non-2xx responses', async () => {
    mockFetch({ '/news?page=1': { status: 500, body: {} } });
    await expect(hackerNewsApi.fetchFeed('news', 1)).rejects.toThrow('responded 500');
    await expect(hackerNewsApi.fetchUser('missing')).rejects.toThrow('responded 404');
  });

  it('propagates aborts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_: RequestInfo | URL, init?: RequestInit) =>
        Promise.reject(init?.signal?.aborted ? new DOMException('Aborted', 'AbortError') : new Error('no')),
      ),
    );
    const controller = new AbortController();
    controller.abort();
    await expect(hackerNewsApi.fetchFeed('news', 1, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('fetchItemContent returns non-poll items untouched', async () => {
    const story = { id: 10, type: 'link', title: 't', comments: [] };
    const fetchMock = mockFetch({ '/item/10': { body: story } });
    await expect(hackerNewsApi.fetchItemContent(10)).resolves.toEqual(story);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fetchItemContent aggregates poll options id+1..id+poll.length', async () => {
    const fetchMock = mockFetch({
      '/item/100': { body: { id: 100, type: 'poll', poll: [{}, {}, {}], comments: [] } },
      '/item/101': { body: { points: 5, content: 'A' } },
      '/item/102': { body: { points: 7, content: 'B' } },
      '/item/103': { body: { points: 0, content: 'C' } },
    });
    const story = await hackerNewsApi.fetchItemContent(100);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(story.poll).toEqual([
      { points: 5, content: 'A' },
      { points: 7, content: 'B' },
      { points: 0, content: 'C' },
    ]);
    expect(story.poll_votes_count).toBe(12);
  });

  it('fetchItemContent keeps a poll option placeholder when its fetch fails', async () => {
    mockFetch({
      '/item/200': { body: { id: 200, type: 'poll', poll: [{ points: 0, content: '' }, {}], comments: [] } },
      '/item/202': { body: { points: 4, content: 'B' } },
    });
    const story = await hackerNewsApi.fetchItemContent(200);
    expect(story.poll).toEqual([{ points: 0, content: '' }, { points: 4, content: 'B' }]);
    expect(story.poll_votes_count).toBe(4);
  });

  it('fetchItemContent rejects when aborted during poll aggregation', async () => {
    const controller = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).endsWith('/item/300')) {
          return new Response(JSON.stringify({ id: 300, type: 'poll', poll: [{}], comments: [] }));
        }
        controller.abort();
        throw new DOMException('Aborted', 'AbortError');
      }),
    );
    await expect(hackerNewsApi.fetchItemContent(300, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
