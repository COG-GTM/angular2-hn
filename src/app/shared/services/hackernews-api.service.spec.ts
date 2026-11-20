import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let requestedUrls: string[];

  beforeEach(() => {
    service = new HackerNewsAPIService();
    requestedUrls = [];
    spyOn(window, 'fetch').and.callFake((url: RequestInfo | URL) => {
      requestedUrls.push(String(url));
      return new Promise<Response>(() => undefined);
    });
  });

  it('requests a feed page lazily, on subscribe', () => {
    const feed$ = service.fetchFeed('news', 2);
    expect(requestedUrls).toEqual([]);
    feed$.subscribe().unsubscribe();
    expect(requestedUrls).toEqual(['https://node-hnapi.herokuapp.com/news?page=2']);
  });

  it('requests item content', () => {
    service.fetchItemContent(8863).subscribe().unsubscribe();
    expect(requestedUrls).toEqual(['https://node-hnapi.herokuapp.com/item/8863']);
  });

  it('requests users from api.hnpwa.com', () => {
    service.fetchUser('pg').subscribe().unsubscribe();
    expect(requestedUrls).toEqual(['https://api.hnpwa.com/v0/user/pg.json']);
  });
});
