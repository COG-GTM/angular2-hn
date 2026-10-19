import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';

/**
 * The service fetches through `unfetch`, which is built on XMLHttpRequest rather than
 * Angular's HttpClient, so HttpTestingController cannot intercept it. This minimal
 * XMLHttpRequest double captures each request so tests can flush canned responses.
 */
class FakeXMLHttpRequest {
  static requests: FakeXMLHttpRequest[] = [];

  method: string;
  url: string;
  responseURL = '';
  status = 0;
  statusText = '';
  responseText = '';
  withCredentials = false;
  onload: () => void;
  onerror: (error: any) => void;

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
  }

  setRequestHeader() {}

  getAllResponseHeaders() {
    return 'content-type: application/json';
  }

  send() {
    FakeXMLHttpRequest.requests.push(this);
  }

  respond(body: any, status = 200) {
    this.status = status;
    this.statusText = 'OK';
    this.responseText = JSON.stringify(body);
    this.onload();
  }

  fail() {
    this.onerror(new TypeError('Network request failed'));
  }
}

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let originalXHR: typeof XMLHttpRequest;

  function expectOne(url: string): FakeXMLHttpRequest {
    const matches = FakeXMLHttpRequest.requests.filter(r => r.url === url);
    expect(matches.length).toBe(1, `expected one request to ${url}`);
    return matches[0];
  }

  beforeEach(() => {
    FakeXMLHttpRequest.requests = [];
    originalXHR = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;

    TestBed.configureTestingModule({ providers: [HackerNewsAPIService] });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('should be created with the node-hnapi base URL', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('should be lazy and not fetch until subscribed', () => {
    service.fetchFeed('news', 1);

    expect(FakeXMLHttpRequest.requests.length).toBe(0);
  });

  describe('fetchFeed', () => {
    it('should GET the feed page and emit the stories', fakeAsync(() => {
      const stories = [{ id: 1, title: 'First' }, { id: 2, title: 'Second' }] as Story[];
      let result: Story[];
      let completed = false;

      service.fetchFeed('news', 2).subscribe(data => (result = data), fail, () => (completed = true));

      const req = expectOne(`${baseUrl}/news?page=2`);
      expect(req.method).toBe('get');
      req.respond(stories);
      flushMicrotasks();

      expect(result).toEqual(stories);
      expect(completed).toBe(true);
    }));

    it('should build the URL from the feed type', fakeAsync(() => {
      ['newest', 'show', 'ask', 'jobs'].forEach(feed => service.fetchFeed(feed, 1).subscribe());

      expect(FakeXMLHttpRequest.requests.map(r => r.url)).toEqual([
        `${baseUrl}/newest?page=1`,
        `${baseUrl}/show?page=1`,
        `${baseUrl}/ask?page=1`,
        `${baseUrl}/jobs?page=1`,
      ]);
    }));

    it('should emit an error when the request fails', fakeAsync(() => {
      let error: any;

      service.fetchFeed('news', 1).subscribe(fail, err => (error = err));
      expectOne(`${baseUrl}/news?page=1`).fail();
      flushMicrotasks();

      expect(error).toEqual(jasmine.any(TypeError));
    }));

    it('should not emit after the subscriber unsubscribes', fakeAsync(() => {
      const next = jasmine.createSpy('next');

      const subscription = service.fetchFeed('news', 1).subscribe(next);
      subscription.unsubscribe();
      expectOne(`${baseUrl}/news?page=1`).respond([{ id: 1 }]);
      flushMicrotasks();

      expect(next).not.toHaveBeenCalled();
    }));
  });

  describe('fetchItemContent', () => {
    it('should GET the item and emit it unchanged for non-poll items', fakeAsync(() => {
      const story = { id: 42, type: 'story', title: 'A story', comments: [] } as Story;
      let result: Story;

      service.fetchItemContent(42).subscribe(data => (result = data));
      expectOne(`${baseUrl}/item/42`).respond(story);
      flushMicrotasks();

      expect(result).toEqual(story);
      expect(FakeXMLHttpRequest.requests.length).toBe(1);
    }));

    it('should fetch each poll option and total the votes for polls', fakeAsync(() => {
      const poll = { id: 100, type: 'poll', title: 'A poll', poll: [{}, {}] } as Story;
      let result: Story;

      service.fetchItemContent(100).subscribe(data => (result = data));
      expectOne(`${baseUrl}/item/100`).respond(poll);
      flushMicrotasks();

      expect(result.poll_votes_count).toBe(0);
      expectOne(`${baseUrl}/item/101`).respond({ points: 7, content: 'Yes' });
      expectOne(`${baseUrl}/item/102`).respond({ points: 3, content: 'No' });
      flushMicrotasks();

      expect(result.poll).toEqual([{ points: 7, content: 'Yes' }, { points: 3, content: 'No' }]);
      expect(result.poll_votes_count).toBe(10);
    }));

    it('should emit an error when the request fails', fakeAsync(() => {
      const error = jasmine.createSpy('error');

      service.fetchItemContent(42).subscribe(fail, error);
      expectOne(`${baseUrl}/item/42`).fail();
      flushMicrotasks();

      expect(error).toHaveBeenCalled();
    }));
  });

  describe('fetchPollContent', () => {
    it('should GET the poll option item', fakeAsync(() => {
      let result: any;

      service.fetchPollContent(7).subscribe(data => (result = data));
      expectOne(`${baseUrl}/item/7`).respond({ points: 5, content: 'Option' });
      flushMicrotasks();

      expect(result).toEqual({ points: 5, content: 'Option' });
    }));
  });

  describe('fetchUser', () => {
    it('should GET the user and emit it', fakeAsync(() => {
      const user = { id: 'pg', karma: 155111, created: '12 years ago', about: 'Bug fixer.' } as User;
      let result: User;

      service.fetchUser('pg').subscribe(data => (result = data));
      expectOne(`${baseUrl}/user/pg`).respond(user);
      flushMicrotasks();

      expect(result).toEqual(user);
    }));

    it('should emit an error when the request fails', fakeAsync(() => {
      const error = jasmine.createSpy('error');

      service.fetchUser('pg').subscribe(fail, error);
      expectOne(`${baseUrl}/user/pg`).fail();
      flushMicrotasks();

      expect(error).toHaveBeenCalled();
    }));
  });
});
