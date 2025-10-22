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

  it('should have correct base URL', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  it('should fetch feed data', (done) => {
    service.fetchFeed('news', 1).subscribe({
      next: (stories) => {
        expect(stories).toBeDefined();
        expect(Array.isArray(stories)).toBeTruthy();
        done();
      },
      error: (error) => {
        fail('fetchFeed should not fail: ' + error);
        done();
      }
    });
  });

  it('should fetch item content', (done) => {
    service.fetchItemContent(1).subscribe({
      next: (story) => {
        expect(story).toBeDefined();
        expect(story.id).toBeDefined();
        done();
      },
      error: (error) => {
        fail('fetchItemContent should not fail: ' + error);
        done();
      }
    });
  });

  it('should fetch user data', (done) => {
    service.fetchUser('test').subscribe({
      next: (user) => {
        expect(user).toBeDefined();
        done();
      },
      error: (error) => {
        fail('fetchUser should not fail: ' + error);
        done();
      }
    });
  });
});
