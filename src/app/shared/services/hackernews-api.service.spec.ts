import { TestBed } from '@angular/core/testing';
import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HackerNewsAPIService]
    });
    service = TestBed.inject(HackerNewsAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have baseUrl set to Hacker News API', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  it('should have fetchFeed method', () => {
    expect(service.fetchFeed).toBeDefined();
    expect(typeof service.fetchFeed).toBe('function');
  });

  it('should have fetchItemContent method', () => {
    expect(service.fetchItemContent).toBeDefined();
    expect(typeof service.fetchItemContent).toBe('function');
  });

  it('should have fetchUser method', () => {
    expect(service.fetchUser).toBeDefined();
    expect(typeof service.fetchUser).toBe('function');
  });

  it('should have fetchPollContent method', () => {
    expect(service.fetchPollContent).toBeDefined();
    expect(typeof service.fetchPollContent).toBe('function');
  });
});
