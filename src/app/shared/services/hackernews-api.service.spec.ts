import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let requestedUrls: string[];
  let originalOpen: typeof XMLHttpRequest.prototype.open;

  beforeEach(() => {
    service = new HackerNewsAPIService();
    requestedUrls = [];
    originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method: string, url: string) {
      requestedUrls.push(url);
    } as typeof XMLHttpRequest.prototype.open;
    spyOn(XMLHttpRequest.prototype, 'send');
  });

  afterEach(() => {
    XMLHttpRequest.prototype.open = originalOpen;
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
