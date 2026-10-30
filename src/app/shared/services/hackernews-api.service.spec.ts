import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Story } from '../models/story';
import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(HackerNewsAPIService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches a feed page', () => {
    let result: Story[] | undefined;
    service.fetchFeed('news', 2).subscribe((stories) => (result = stories));

    http.expectOne('https://node-hnapi.herokuapp.com/news?page=2').flush([{ id: 1, title: 'Hello' }]);

    expect(result).toEqual([{ id: 1, title: 'Hello' }] as Story[]);
  });

  it('fetches poll results and totals the votes for poll items', () => {
    let result: Story | undefined;
    service.fetchItemContent(10).subscribe((story) => (result = story));

    http.expectOne('https://node-hnapi.herokuapp.com/item/10').flush({ id: 10, type: 'poll', poll: [{}, {}] });
    http.expectOne('https://node-hnapi.herokuapp.com/item/11').flush({ points: 3, content: 'A' });
    http.expectOne('https://node-hnapi.herokuapp.com/item/12').flush({ points: 5, content: 'B' });

    expect(result?.poll).toEqual([
      { points: 3, content: 'A' },
      { points: 5, content: 'B' },
    ]);
    expect(result?.poll_votes_count).toBe(8);
  });

  it('still returns the poll story when an option fails to load', () => {
    let result: Story | undefined;
    service.fetchItemContent(10).subscribe((story) => (result = story));

    http.expectOne('https://node-hnapi.herokuapp.com/item/10').flush({ id: 10, type: 'poll', poll: [{}, {}] });
    http.expectOne('https://node-hnapi.herokuapp.com/item/11').flush({ points: 3, content: 'A' });
    http
      .expectOne('https://node-hnapi.herokuapp.com/item/12')
      .flush('error', { status: 500, statusText: 'Server Error' });

    expect(result?.poll).toEqual([{ points: 3, content: 'A' }]);
    expect(result?.poll_votes_count).toBe(3);
  });

  it('errors when every poll option fails to load', () => {
    let error: unknown;
    service.fetchItemContent(10).subscribe({ error: (e) => (error = e) });

    http.expectOne('https://node-hnapi.herokuapp.com/item/10').flush({ id: 10, type: 'poll', poll: [{}, {}] });
    for (const id of [11, 12]) {
      http
        .expectOne(`https://node-hnapi.herokuapp.com/item/${id}`)
        .flush('error', { status: 500, statusText: 'Server Error' });
    }

    expect(error).toBeInstanceOf(Error);
  });

  it('fetches a user', () => {
    service.fetchUser('pg').subscribe();
    http.expectOne('https://node-hnapi.herokuapp.com/user/pg').flush({ id: 'pg' });
  });
});
