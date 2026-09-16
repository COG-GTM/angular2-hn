import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';

class FakeXMLHttpRequest {
  static instances: FakeXMLHttpRequest[] = [];

  onload: () => void;
  onerror: (err?: any) => void;
  status = 200;
  statusText = 'OK';
  responseText = '';
  responseURL = '';
  withCredentials = false;
  method: string;
  url: string;
  headers: { [key: string]: string } = {};

  constructor() {
    FakeXMLHttpRequest.instances.push(this);
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }

  getAllResponseHeaders() {
    return '';
  }

  send() {}
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let originalXHR: any;

  function lastRequest(): FakeXMLHttpRequest {
    return FakeXMLHttpRequest.instances[FakeXMLHttpRequest.instances.length - 1];
  }

  function respond(request: FakeXMLHttpRequest, body: any) {
    request.responseText = JSON.stringify(body);
    request.onload();
  }

  beforeEach(() => {
    service = new HackerNewsAPIService();
    FakeXMLHttpRequest.instances = [];
    originalXHR = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('should build the feed URL and emit parsed JSON', (done) => {
    const stories = [{ id: 1, title: 'a' }];
    service.fetchFeed('news', 2).subscribe(data => {
      expect(data).toEqual(stories as Story[]);
      done();
    });
    const req = lastRequest();
    expect(req.url).toBe('https://node-hnapi.herokuapp.com/news?page=2');
    expect(req.method.toLowerCase()).toBe('get');
    respond(req, stories);
  });

  it('should fetch a user by id', (done) => {
    const user = { id: 'bob', karma: 10 };
    service.fetchUser('bob').subscribe(data => {
      expect(data).toEqual(user as any);
      done();
    });
    const req = lastRequest();
    expect(req.url).toBe('https://node-hnapi.herokuapp.com/user/bob');
    respond(req, user);
  });

  it('should fetch poll content by id', (done) => {
    const poll = { id: 101, points: 4 };
    service.fetchPollContent(101).subscribe(data => {
      expect(data).toEqual(poll as any);
      done();
    });
    const req = lastRequest();
    expect(req.url).toBe('https://node-hnapi.herokuapp.com/item/101');
    respond(req, poll);
  });

  it('should emit a non-poll story unchanged', (done) => {
    const story = { id: 5, type: 'link', poll: [] };
    service.fetchItemContent(5).subscribe(data => {
      expect(data).toEqual(story as Story);
      done();
    });
    respond(lastRequest(), story);
  });

  it('should fetch poll options and sum their points for poll stories', (done) => {
    const story = {
      id: 100,
      type: 'poll',
      poll: [{}, {}],
      poll_votes_count: 5
    };
    service.fetchItemContent(100).subscribe(data => {
      expect(FakeXMLHttpRequest.instances.length).toBe(3);
      expect(FakeXMLHttpRequest.instances[1].url).toBe('https://node-hnapi.herokuapp.com/item/101');
      expect(FakeXMLHttpRequest.instances[2].url).toBe('https://node-hnapi.herokuapp.com/item/102');
      respond(FakeXMLHttpRequest.instances[1], { id: 101, points: 3 });
      respond(FakeXMLHttpRequest.instances[2], { id: 102, points: 7 });
      setTimeout(() => {
        expect(data.poll[0]).toEqual({ id: 101, points: 3 } as any);
        expect(data.poll[1]).toEqual({ id: 102, points: 7 } as any);
        expect(data.poll_votes_count).toBe(10);
        done();
      });
    });
    respond(lastRequest(), story);
  });

  it('should call the error callback when the request fails', (done) => {
    service.fetchFeed('news', 1).subscribe(
      () => fail('should not emit'),
      err => {
        expect(err).toBeTruthy();
        done();
      }
    );
    lastRequest().onerror(new Error('network failure'));
  });

  it('should not call next when unsubscribed before the response', (done) => {
    const nextSpy = jasmine.createSpy('next');
    const subscription = service.fetchFeed('news', 1).subscribe(nextSpy);
    subscription.unsubscribe();
    respond(lastRequest(), [{ id: 1 }]);
    setTimeout(() => {
      expect(nextSpy).not.toHaveBeenCalled();
      done();
    }, 10);
  });
});
