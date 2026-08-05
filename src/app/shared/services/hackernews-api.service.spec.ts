import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Story } from '../models/story';
import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
  const baseUrl = environment.hnApiBaseUrl;
  const officialApiBaseUrl = environment.hnOfficialApiBaseUrl;
  let service: HackerNewsAPIService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(HackerNewsAPIService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('requests a page of a feed and returns the stories', () => {
    const stories = [{ id: 1, title: 'A story' }] as Story[];
    let response: Story[];

    service.fetchFeed('news', 2).subscribe(items => (response = items));

    httpTesting.expectOne(`${baseUrl}/news/2.json`).flush(stories);
    expect(response).toEqual(stories);
  });

  it('requests a single item', () => {
    const story = { id: 42, title: 'A story', type: 'link' } as unknown as Story;
    let response: Story;

    service.fetchItemContent(42).subscribe(item => (response = item));

    httpTesting.expectOne(`${baseUrl}/item/42.json`).flush(story);
    expect(response).toEqual(story);
  });

  it('resolves the options of a poll and sums their votes', () => {
    const poll = { id: 10, type: 'poll' } as unknown as Story;
    let response: Story;

    service.fetchItemContent(10).subscribe(item => (response = item));

    httpTesting.expectOne(`${baseUrl}/item/10.json`).flush(poll);
    httpTesting.expectOne(`${officialApiBaseUrl}/item/10.json`).flush({ parts: [11, 12] });
    httpTesting.expectOne(`${baseUrl}/item/11.json`).flush({ content: 'first', points: 3 });
    httpTesting.expectOne(`${baseUrl}/item/12.json`).flush({ content: 'second', points: 4 });

    expect(response.poll).toEqual([
      { content: 'first', points: 3 },
      { content: 'second', points: 4 },
    ]);
    expect(response.poll_votes_count).toBe(7);
  });

  it('requests a user profile', () => {
    service.fetchUser('pg').subscribe();

    const request = httpTesting.expectOne(`${baseUrl}/user/pg.json`);
    expect(request.request.method).toBe('GET');
    request.flush({ id: 'pg', karma: 1 });
  });
});
