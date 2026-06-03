import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';

// Minimal controllable fake for the XMLHttpRequest that `unfetch` uses under
// the hood. This keeps every test fully offline and deterministic.
class FakeXHR {
  static queue: string[] = [];
  static failNext = false;
  static requestedUrls: string[] = [];

  status = 0;
  statusText = 'OK';
  responseURL = '';
  responseText = '';
  withCredentials = false;
  onload: (() => void) | null = null;
  onerror: ((err?: any) => void) | null = null;

  method = '';
  open(method: string, url: string) {
    this.method = method;
    this.responseURL = url;
    FakeXHR.requestedUrls.push(url);
  }
  setRequestHeader() {}
  getAllResponseHeaders() {
    return '';
  }
  send() {
    Promise.resolve().then(() => {
      if (FakeXHR.failNext) {
        this.status = 500;
        if (this.onerror) {
          this.onerror(new Error('network error'));
        }
        return;
      }
      this.status = 200;
      this.responseText = FakeXHR.queue.shift() || '{}';
      if (this.onload) {
        this.onload();
      }
    });
  }
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let originalXHR: typeof XMLHttpRequest;

  beforeEach(() => {
    originalXHR = window.XMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXHR;
    FakeXHR.queue = [];
    FakeXHR.failNext = false;
    FakeXHR.requestedUrls = [];

    TestBed.configureTestingModule({
      providers: [HackerNewsAPIService],
    });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('is created with the expected base url', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  it('fetchFeed requests the correct url and emits the parsed stories', fakeAsync(() => {
    const stories = [{ id: 1, title: 'a' }, { id: 2, title: 'b' }];
    FakeXHR.queue = [JSON.stringify(stories)];

    let result: Story[] | undefined;
    service.fetchFeed('news', 2).subscribe(data => (result = data));
    flushMicrotasks();

    expect(FakeXHR.requestedUrls[0]).toBe('https://node-hnapi.herokuapp.com/news?page=2');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
  }));

  it('fetchUser requests the user endpoint', fakeAsync(() => {
    FakeXHR.queue = [JSON.stringify({ id: 'pg', karma: 100 })];

    let user: any;
    service.fetchUser('pg').subscribe(data => (user = data));
    flushMicrotasks();

    expect(FakeXHR.requestedUrls[0]).toBe('https://node-hnapi.herokuapp.com/user/pg');
    expect(user.id).toBe('pg');
  }));

  it('fetchPollContent requests the item endpoint', fakeAsync(() => {
    FakeXHR.queue = [JSON.stringify({ points: 5, content: 'option' })];

    let poll: any;
    service.fetchPollContent(99).subscribe(data => (poll = data));
    flushMicrotasks();

    expect(FakeXHR.requestedUrls[0]).toBe('https://node-hnapi.herokuapp.com/item/99');
    expect(poll.points).toBe(5);
  }));

  it('fetchItemContent returns a non-poll story untouched', fakeAsync(() => {
    FakeXHR.queue = [JSON.stringify({ id: 10, type: 'story', title: 'hello' })];

    let story: Story | undefined;
    service.fetchItemContent(10).subscribe(data => (story = data));
    flushMicrotasks();

    expect(FakeXHR.requestedUrls[0]).toBe('https://node-hnapi.herokuapp.com/item/10');
    expect(story.type).toBe('story');
    expect(story.poll_votes_count).toBeUndefined();
  }));

  it('fetchItemContent resolves poll options and tallies the vote count', fakeAsync(() => {
    const pollStory = {
      id: 100,
      type: 'poll',
      poll: [{ points: 0 }, { points: 0 }],
    };
    FakeXHR.queue = [
      JSON.stringify(pollStory),
      JSON.stringify({ points: 3, content: 'first' }),
      JSON.stringify({ points: 7, content: 'second' }),
    ];

    let story: Story | undefined;
    service.fetchItemContent(100).subscribe(data => (story = data));
    flushMicrotasks();

    expect(story.poll_votes_count).toBe(10);
    expect(story.poll[0].points).toBe(3);
    expect(story.poll[1].points).toBe(7);
    // outer item + two poll option requests
    expect(FakeXHR.requestedUrls.length).toBe(3);
  }));

  it('propagates errors from the underlying fetch', fakeAsync(() => {
    FakeXHR.failNext = true;

    let errored = false;
    service.fetchFeed('news', 1).subscribe(
      () => {},
      () => (errored = true)
    );
    flushMicrotasks();

    expect(errored).toBe(true);
  }));

  it('does not emit when unsubscribed before the response resolves', fakeAsync(() => {
    FakeXHR.queue = [JSON.stringify([{ id: 1 }])];

    let emitted = false;
    const sub = service.fetchFeed('news', 1).subscribe(() => (emitted = true));
    sub.unsubscribe();
    flushMicrotasks();

    expect(emitted).toBe(false);
  }));
});
