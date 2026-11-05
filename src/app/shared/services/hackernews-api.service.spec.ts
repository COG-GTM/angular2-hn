import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { HN_FEED_API, HN_FIREBASE_API, HackerNewsAPIService, timeAgo } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(HackerNewsAPIService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches a feed page', () => {
    let result: unknown;
    service.fetchFeed('news', 2).subscribe(items => (result = items));
    http.expectOne(`${HN_FEED_API}/news?page=2`).flush([{ id: 1 }]);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('maps poll options and totals votes', () => {
    let result: unknown;
    service.fetchItemContent(7).subscribe(item => (result = item));
    http.expectOne(`${HN_FEED_API}/item/7`).flush({
      id: 7,
      poll: [
        { item: 'Yes', points: 3 },
        { item: 'No', points: 2 },
      ],
    });
    expect(result).toEqual(
      jasmine.objectContaining({
        id: 7,
        poll: [
          { content: 'Yes', points: 3 },
          { content: 'No', points: 2 },
        ],
        poll_votes_count: 5,
      })
    );
  });

  it('errors when the item API reports an error', () => {
    let error: Error | undefined;
    service.fetchItemContent(1).subscribe({ error: e => (error = e) });
    http.expectOne(`${HN_FEED_API}/item/1`).flush({ error: 'not found' });
    expect(error?.message).toBe('not found');
  });

  it('maps Firebase users', () => {
    let result: unknown;
    service.fetchUser('pg').subscribe(user => (result = user));
    http.expectOne(`${HN_FIREBASE_API}/user/pg.json`).flush({ id: 'pg', created: 1160418092, karma: 10, about: 'hi' });
    expect(result).toEqual(jasmine.objectContaining({ id: 'pg', karma: 10, about: 'hi', created_time: 1160418092 }));
  });

  it('errors for unknown users', () => {
    let error: Error | undefined;
    service.fetchUser('nobody').subscribe({ error: e => (error = e) });
    http.expectOne(`${HN_FIREBASE_API}/user/nobody.json`).flush(null);
    expect(error?.message).toBe('User nobody not found');
  });
});

describe('timeAgo', () => {
  const now = 1_700_000_000_000;
  const nowSeconds = now / 1000;

  it('formats relative times', () => {
    expect(timeAgo(nowSeconds - 10, now)).toBe('just now');
    expect(timeAgo(nowSeconds - 60, now)).toBe('1 minute ago');
    expect(timeAgo(nowSeconds - 3 * 3600, now)).toBe('3 hours ago');
    expect(timeAgo(nowSeconds - 2 * 365 * 24 * 3600, now)).toBe('2 years ago');
  });
});
