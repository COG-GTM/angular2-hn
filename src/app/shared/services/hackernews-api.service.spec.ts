import { HackerNewsAPIService } from './hackernews-api.service';
import { installFixtureXhr, uninstallFixtureXhr } from '../../../testing/mock-xhr';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;

  beforeEach(() => {
    installFixtureXhr();
    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    uninstallFixtureXhr();
  });

  it('fetchFeed returns the feed list for a feedType/page', (done) => {
    service.fetchFeed('news', 1).subscribe((items) => {
      expect(items.length).toBe(30);
      expect(items[0].id).toBe(1001);
      expect(items[0].title).toBe('News story 1');
      done();
    });
  });

  it('fetchFeed reflects a different page', (done) => {
    service.fetchFeed('news', 2).subscribe((items) => {
      expect(items.length).toBe(5);
      expect(items[0].id).toBe(1031);
      done();
    });
  });

  it('fetchItemContent returns a story with nested comments', (done) => {
    service.fetchItemContent(1001).subscribe((item) => {
      expect(item.id).toBe(1001);
      expect(item.comments.length).toBe(2);
      expect(item.comments[0].comments[0].content).toBe('<p>Nested reply</p>');
      done();
    });
  });

  it('fetchItemContent expands poll options and sums poll_votes_count', (done) => {
    service.fetchItemContent(300).subscribe((item) => {
      expect(item.type).toBe('poll');
      // Poll option items are fetched individually and summed asynchronously;
      // give the inner subscriptions a tick to complete.
      setTimeout(() => {
        expect(item.poll.map((p) => p.points)).toEqual([60, 40, 20]);
        expect(item.poll_votes_count).toBe(120);
        done();
      }, 20);
    });
  });

  it('fetchUser returns the user profile', (done) => {
    service.fetchUser('user1').subscribe((user) => {
      expect(user.id).toBe('user1');
      expect(user.karma).toBe(1234);
      done();
    });
  });

  it('propagates an error when the resource is missing', (done) => {
    service.fetchItemContent(999999).subscribe(
      () => fail('expected an error'),
      (err) => {
        expect(err).toBeTruthy();
        done();
      }
    );
  });
});
