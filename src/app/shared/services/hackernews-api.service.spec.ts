import { fakeAsync, tick } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';

class FakeXMLHttpRequest {
  static original: any;
  static responses: {[url: string]: any} = {};
  static errorUrls: {[url: string]: boolean} = {};
  static deferred = false;
  static instances: FakeXMLHttpRequest[] = [];

  method: string;
  url: string;
  async: boolean;
  private delegate: any;
  private responseBody = '';
  private statusCode = 0;
  private statusMessage = '';
  private responseLocation = '';
  private loadHandler: () => void;
  private errorHandler: (error: Error) => void;

  constructor() {
    FakeXMLHttpRequest.instances.push(this);
  }

  get status() {
    return this.delegate ? this.delegate.status : this.statusCode;
  }

  get statusText() {
    return this.delegate ? this.delegate.statusText : this.statusMessage;
  }

  get responseText() {
    return this.delegate ? this.delegate.responseText : this.responseBody;
  }

  get responseURL() {
    return this.delegate ? this.delegate.responseURL : this.responseLocation;
  }

  set onload(handler: () => void) {
    this.loadHandler = handler;
    if (this.delegate) {
      this.delegate.onload = handler;
    }
  }

  get onload() {
    return this.loadHandler;
  }

  set onerror(handler: (error: Error) => void) {
    this.errorHandler = handler;
    if (this.delegate) {
      this.delegate.onerror = handler;
    }
  }

  get onerror() {
    return this.errorHandler;
  }

  open(method: string, url: string, async: boolean) {
    this.method = method;
    this.url = url;
    this.async = async;
    this.responseLocation = url;
    if (url.indexOf('https://node-hnapi.herokuapp.com') !== 0 && FakeXMLHttpRequest.original) {
      this.delegate = new FakeXMLHttpRequest.original();
      this.delegate.open(method, url, async);
    }
  }

  send() {
    if (this.delegate) {
      this.delegate.onload = this.loadHandler;
      this.delegate.onerror = this.errorHandler;
      this.delegate.send();
      return;
    }
    if (!FakeXMLHttpRequest.deferred) {
      this.flush();
    }
  }

  flush() {
    if (FakeXMLHttpRequest.errorUrls[this.url]) {
      this.errorHandler(new Error('boom'));
      return;
    }
    this.statusCode = 200;
    this.statusMessage = 'OK';
    this.responseBody = JSON.stringify(FakeXMLHttpRequest.responses[this.url]);
    this.loadHandler();
  }

  getAllResponseHeaders() {
    return this.delegate ? this.delegate.getAllResponseHeaders() : '';
  }

  setRequestHeader(name: string, value: string) {
    if (this.delegate) {
      this.delegate.setRequestHeader(name, value);
    }
  }
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let originalXMLHttpRequest: any;

  beforeEach(() => {
    originalXMLHttpRequest = (window as any).XMLHttpRequest;
    FakeXMLHttpRequest.original = originalXMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;
    FakeXMLHttpRequest.responses = {};
    FakeXMLHttpRequest.errorUrls = {};
    FakeXMLHttpRequest.deferred = false;
    FakeXMLHttpRequest.instances = [];
    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXMLHttpRequest;
  });

  it('fetches a feed by type and page', (done) => {
    const story = {id: 1, title: 'Story'};
    FakeXMLHttpRequest.responses['https://node-hnapi.herokuapp.com/news?page=2'] = [story];

    service.fetchFeed('news', 2).subscribe(items => {
      expect(items as any).toEqual([story]);
      expect(FakeXMLHttpRequest.instances[0].method).toBe('get');
      expect(FakeXMLHttpRequest.instances[0].url).toBe('https://node-hnapi.herokuapp.com/news?page=2');
      done();
    });
  });

  it('fetches a user', (done) => {
    const user = {id: 'pg'};
    FakeXMLHttpRequest.responses['https://node-hnapi.herokuapp.com/user/pg'] = user;

    service.fetchUser('pg').subscribe(result => {
      expect(result as any).toEqual(user);
      expect(FakeXMLHttpRequest.instances[0].url).toBe('https://node-hnapi.herokuapp.com/user/pg');
      done();
    });
  });

  it('fetches poll content', (done) => {
    const pollResult = {points: 5, content: 'Option'};
    FakeXMLHttpRequest.responses['https://node-hnapi.herokuapp.com/item/5'] = pollResult;

    service.fetchPollContent(5).subscribe(result => {
      expect(result).toEqual(pollResult);
      expect(FakeXMLHttpRequest.instances[0].url).toBe('https://node-hnapi.herokuapp.com/item/5');
      done();
    });
  });

  it('returns a non-poll story unchanged', (done) => {
    const story: any = {id: 8, type: 'story', title: 'Story'};
    FakeXMLHttpRequest.responses['https://node-hnapi.herokuapp.com/item/8'] = story;

    service.fetchItemContent(8).subscribe(result => {
      expect(result).toEqual(story);
      expect(result.poll_votes_count).toBeUndefined();
      done();
    });
  });

  it('loads poll options and totals their votes', fakeAsync(() => {
    const story: any = {
      id: 10,
      type: 'poll',
      poll: [{content: 'One'}, {content: 'Two'}]
    };
    FakeXMLHttpRequest.responses['https://node-hnapi.herokuapp.com/item/10'] = story;
    FakeXMLHttpRequest.responses['https://node-hnapi.herokuapp.com/item/11'] = {points: 3, content: 'One'};
    FakeXMLHttpRequest.responses['https://node-hnapi.herokuapp.com/item/12'] = {points: 7, content: 'Two'};
    let result: any;

    service.fetchItemContent(10).subscribe(item => result = item);
    tick();

    expect(result.poll[0]).toEqual({points: 3, content: 'One'});
    expect(result.poll[1]).toEqual({points: 7, content: 'Two'});
    expect(result.poll_votes_count).toBe(10);
    expect(FakeXMLHttpRequest.instances.map(instance => instance.url)).toEqual([
      'https://node-hnapi.herokuapp.com/item/10',
      'https://node-hnapi.herokuapp.com/item/11',
      'https://node-hnapi.herokuapp.com/item/12'
    ]);
  }));

  it('emits network errors', (done) => {
    const url = 'https://node-hnapi.herokuapp.com/news?page=1';
    FakeXMLHttpRequest.errorUrls[url] = true;

    service.fetchFeed('news', 1).subscribe(
      () => fail('expected an error'),
      error => {
        expect(error.message).toBe('boom');
        done();
      }
    );
  });

  it('does not emit after unsubscribing before the response', () => {
    const url = 'https://node-hnapi.herokuapp.com/news?page=1';
    FakeXMLHttpRequest.deferred = true;
    FakeXMLHttpRequest.responses[url] = [{id: 1}];
    const next = jasmine.createSpy('next');
    const subscription = service.fetchFeed('news', 1).subscribe(next);

    subscription.unsubscribe();
    FakeXMLHttpRequest.instances[0].flush();

    expect(next).not.toHaveBeenCalled();
  });
});
