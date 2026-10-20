import { TestBed } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';

// HackerNewsAPIService fetches through `unfetch` (a thin XMLHttpRequest wrapper),
// not HttpClient, so HttpTestingController can't intercept it. Requests are captured
// with a fake XMLHttpRequest instead, which plays the same role.
class FakeXhr {
  static requests: FakeXhr[] = [];

  method: string;
  url: string;
  status = 0;
  statusText = '';
  responseText = '';
  responseURL = '';
  withCredentials = false;
  onload: () => void;
  onerror: (err: any) => void;

  constructor() {
    FakeXhr.requests.push(this);
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader() {}

  send() {}

  getAllResponseHeaders() {
    return 'content-type: application/json';
  }

  flush(body: any, status = 200) {
    this.status = status;
    this.statusText = 'OK';
    this.responseURL = this.url;
    this.responseText = JSON.stringify(body);
    this.onload();
  }

  fail() {
    this.onerror(new TypeError('Network request failed'));
  }
}

const BASE_URL = 'https://node-hnapi.herokuapp.com';

function lastRequest(): FakeXhr {
  return FakeXhr.requests[FakeXhr.requests.length - 1];
}

function requestFor(url: string): FakeXhr {
  const req = FakeXhr.requests.find(r => r.url === url);
  if (!req) {
    fail(`No request made to ${url}; requests: ${FakeXhr.requests.map(r => r.url).join(', ')}`);
  }
  return req;
}

// unfetch resolves via chained promises, so let the microtask queue drain.
function settle(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve));
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let realXhr: typeof XMLHttpRequest;

  beforeEach(() => {
    FakeXhr.requests = [];
    realXhr = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXhr;

    TestBed.configureTestingModule({ providers: [HackerNewsAPIService] });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = realXhr;
  });

  it('uses the node-hnapi base path', () => {
    expect(service.baseUrl).toBe(BASE_URL);
  });

  describe('fetchFeed', () => {
    ['news', 'newest', 'show', 'ask', 'jobs'].forEach(feedType => {
      it(`builds the ${feedType} feed URL with the page number`, () => {
        service.fetchFeed(feedType, 3).subscribe();
        expect(FakeXhr.requests.length).toBe(1);
        expect(lastRequest().method).toBe('get');
        expect(lastRequest().url).toBe(`${BASE_URL}/${feedType}?page=3`);
      });
    });

    it('emits the stories and completes', async () => {
      const stories = [{ id: 1, title: 'First' }, { id: 2, title: 'Second' }] as Story[];
      const next = jasmine.createSpy('next');
      const complete = jasmine.createSpy('complete');

      service.fetchFeed('news', 1).subscribe(next, fail, complete);
      lastRequest().flush(stories);
      await settle();

      expect(next).toHaveBeenCalledWith(stories);
      expect(complete).toHaveBeenCalled();
    });

    it('is lazy: no request until subscribed', () => {
      const feed$ = service.fetchFeed('news', 1);
      expect(FakeXhr.requests.length).toBe(0);
      feed$.subscribe();
      expect(FakeXhr.requests.length).toBe(1);
    });

    it('does not emit after unsubscribe', async () => {
      const next = jasmine.createSpy('next');
      const sub = service.fetchFeed('news', 1).subscribe(next);
      sub.unsubscribe();
      lastRequest().flush([]);
      await settle();
      expect(next).not.toHaveBeenCalled();
    });

    it('propagates network errors', async () => {
      const error = jasmine.createSpy('error');
      service.fetchFeed('news', 1).subscribe(fail, error);
      lastRequest().fail();
      await settle();
      expect(error).toHaveBeenCalled();
    });
  });

  describe('fetchItemContent', () => {
    it('builds the item URL and emits the story', async () => {
      const story = { id: 42, type: 'story', title: 'Hello' } as Story;
      const next = jasmine.createSpy('next');

      service.fetchItemContent(42).subscribe(next);
      expect(lastRequest().url).toBe(`${BASE_URL}/item/42`);
      lastRequest().flush(story);
      await settle();

      expect(next).toHaveBeenCalledWith(jasmine.objectContaining({ id: 42, title: 'Hello' }));
      expect(FakeXhr.requests.length).toBe(1);
    });

    it('fetches each poll option and tallies the votes', async () => {
      const poll = { id: 100, type: 'poll', title: 'Poll', poll: [{}, {}] } as any;
      let result: Story;

      service.fetchItemContent(100).subscribe(s => (result = s));
      requestFor(`${BASE_URL}/item/100`).flush(poll);
      await settle();

      expect(result.poll_votes_count).toBe(0);
      requestFor(`${BASE_URL}/item/101`).flush({ points: 7, content: 'Yes' });
      requestFor(`${BASE_URL}/item/102`).flush({ points: 3, content: 'No' });
      await settle();

      expect(result.poll).toEqual([{ points: 7, content: 'Yes' }, { points: 3, content: 'No' }]);
      expect(result.poll_votes_count).toBe(10);
    });

    it('propagates errors', async () => {
      const error = jasmine.createSpy('error');
      service.fetchItemContent(1).subscribe(fail, error);
      lastRequest().fail();
      await settle();
      expect(error).toHaveBeenCalled();
    });
  });

  describe('fetchPollContent', () => {
    it('builds the item URL for a poll option', async () => {
      const next = jasmine.createSpy('next');
      service.fetchPollContent(7).subscribe(next);
      expect(lastRequest().url).toBe(`${BASE_URL}/item/7`);
      lastRequest().flush({ points: 1, content: 'opt' });
      await settle();
      expect(next).toHaveBeenCalledWith({ points: 1, content: 'opt' });
    });
  });

  describe('fetchUser', () => {
    it('builds the user URL and emits the user', async () => {
      const user = { id: 'pg', karma: 155000, created: '12 years ago' } as User;
      const next = jasmine.createSpy('next');

      service.fetchUser('pg').subscribe(next);
      expect(lastRequest().url).toBe(`${BASE_URL}/user/pg`);
      lastRequest().flush(user);
      await settle();

      expect(next).toHaveBeenCalledWith(user);
    });

    it('propagates errors', async () => {
      const error = jasmine.createSpy('error');
      service.fetchUser('nobody').subscribe(fail, error);
      lastRequest().fail();
      await settle();
      expect(error).toHaveBeenCalled();
    });
  });
});
