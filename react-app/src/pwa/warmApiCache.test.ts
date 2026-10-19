import { warmApiCacheOnFirstControl } from './warmApiCache';

describe('warmApiCacheOnFirstControl', () => {
  const listeners: Record<string, () => void> = {};
  const fetchMock = vi.fn(() => Promise.resolve(new Response('{}')));

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      { name: 'https://node-hnapi.herokuapp.com/news?page=1' },
      { name: 'https://node-hnapi.herokuapp.com/news?page=1' },
      { name: 'https://api.hnpwa.com/v0/user/pg.json' },
      { name: 'http://localhost/assets/index.js' },
    ] as PerformanceEntry[]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function stubServiceWorker(controller: object | null) {
    vi.stubGlobal('navigator', {
      serviceWorker: {
        controller,
        addEventListener: (type: string, cb: () => void) => (listeners[type] = cb),
      },
    });
  }

  it('re-fetches earlier API requests once the worker takes control', () => {
    stubServiceWorker(null);
    warmApiCacheOnFirstControl();
    expect(fetchMock).not.toHaveBeenCalled();
    listeners.controllerchange();
    expect(fetchMock.mock.calls.map((c) => (c as unknown[])[0])).toEqual([
      'https://node-hnapi.herokuapp.com/news?page=1',
      'https://api.hnpwa.com/v0/user/pg.json',
    ]);
  });

  it('does nothing when the page is already controlled', () => {
    delete listeners.controllerchange;
    stubServiceWorker({});
    warmApiCacheOnFirstControl();
    expect(listeners.controllerchange).toBeUndefined();
  });
});
