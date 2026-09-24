import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';

interface FakeRequest {
  url: string;
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let requests: FakeRequest[];
  let responder: (url: string) => any;

  const realOpen = XMLHttpRequest.prototype.open;
  const realSend = XMLHttpRequest.prototype.send;

  function respondWith(body: any) {
    responder = () => body;
  }

  beforeEach(() => {
    service = new HackerNewsAPIService();
    requests = [];
    const baseUrl = service.baseUrl;

    spyOn(XMLHttpRequest.prototype, 'open').and.callFake(function(method: string, url: string) {
      if (url.indexOf(baseUrl) !== 0) {
        return realOpen.apply(this, arguments);
      }
      (this as any).__fakeUrl = url;
    });

    spyOn(XMLHttpRequest.prototype, 'send').and.callFake(function(body?: any) {
      const xhr: XMLHttpRequest = this;
      const url = (xhr as any).__fakeUrl;
      if (!url) {
        return realSend.call(xhr, body);
      }
      requests.push({ url });
      Promise.resolve().then(() => {
        const result = responder(url);
        if (result instanceof Error) {
          xhr.dispatchEvent(new Event('error'));
          return;
        }
        const text = JSON.stringify(result);
        Object.defineProperties(xhr, {
          status: { value: 200 },
          statusText: { value: 'OK' },
          responseURL: { value: url },
          responseText: { value: text },
          response: { value: text },
          getAllResponseHeaders: { value: () => 'content-type: application/json' },
        });
        xhr.dispatchEvent(new Event('load'));
      });
    });
  });

  it('fetches a feed page', done => {
    const stories = [{ id: 1 }, { id: 2 }];
    respondWith(stories);

    service.fetchFeed('news', 2).subscribe(result => {
      expect(requests[0].url).toBe(`${service.baseUrl}/news?page=2`);
      expect(result).toEqual(stories as Story[]);
      done();
    });
  });

  it('fetches a user', done => {
    respondWith({ id: 'pg', karma: 1 });

    service.fetchUser('pg').subscribe(result => {
      expect(requests[0].url).toBe(`${service.baseUrl}/user/pg`);
      expect(result.id).toBe('pg');
      done();
    });
  });

  it('fetches poll content', done => {
    respondWith({ points: 3, content: 'opt' });

    service.fetchPollContent(5).subscribe(result => {
      expect(requests[0].url).toBe(`${service.baseUrl}/item/5`);
      expect(result.points).toBe(3);
      done();
    });
  });

  it('fetches a story item unchanged when it is not a poll', done => {
    const story = { id: 10, type: 'story', title: 't' };
    respondWith(story);

    service.fetchItemContent(10).subscribe(result => {
      expect(result).toEqual(story as any);
      expect(requests.length).toBe(1);
      done();
    });
  });

  it('fetches poll options and accumulates votes for a poll', done => {
    responder = (url: string) => {
      if (url.endsWith('/item/100')) {
        return { id: 100, type: 'poll', poll: [{}, {}] };
      }
      if (url.endsWith('/item/101')) {
        return { points: 2, content: 'a' };
      }
      return { points: 5, content: 'b' };
    };

    service.fetchItemContent(100).subscribe(result => {
      setTimeout(() => {
        expect(result.poll_votes_count).toBe(7);
        expect(result.poll[0].content).toBe('a');
        expect(result.poll[1].content).toBe('b');
        expect(requests.length).toBe(3);
        done();
      });
    });
  });

  it('propagates fetch errors', done => {
    responder = () => new Error('offline');

    service.fetchFeed('news', 1).subscribe(
      () => fail('should not emit'),
      err => {
        expect(err).toBeDefined();
        done();
      }
    );
  });

  it('does not emit after unsubscribe', done => {
    respondWith([]);
    const next = jasmine.createSpy('next');

    const sub = service.fetchFeed('news', 1).subscribe(next);
    sub.unsubscribe();

    setTimeout(() => {
      expect(requests.length).toBe(1);
      expect(next).not.toHaveBeenCalled();
      done();
    });
  });
});
