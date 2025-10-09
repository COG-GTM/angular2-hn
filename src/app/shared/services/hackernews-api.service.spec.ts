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

  it('should have baseUrl set to https://node-hnapi.herokuapp.com', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  describe('fetchFeed', () => {
    it('should return an Observable', (done) => {
      const feedType = 'news';
      const page = 1;
      
      const result = service.fetchFeed(feedType, page);
      
      expect(result).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
      
      result.subscribe({
        next: (data) => {
          expect(Array.isArray(data)).toBeTruthy();
          done();
        },
        error: (error) => {
          done();
        }
      });
    });
  });

  describe('fetchItemContent', () => {
    it('should return an Observable', (done) => {
      const itemId = 1;
      
      const result = service.fetchItemContent(itemId);
      
      expect(result).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
      
      result.subscribe({
        next: (data) => {
          expect(data).toBeDefined();
          done();
        },
        error: (error) => {
          done();
        }
      });
    });
  });

  describe('fetchUser', () => {
    it('should return an Observable', (done) => {
      const userId = 'test-user';
      
      const result = service.fetchUser(userId);
      
      expect(result).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
      
      result.subscribe({
        next: (data) => {
          expect(data).toBeDefined();
          done();
        },
        error: (error) => {
          done();
        }
      });
    });
  });

  describe('fetchPollContent', () => {
    it('should return an Observable', (done) => {
      const pollId = 1;
      
      const result = service.fetchPollContent(pollId);
      
      expect(result).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
      
      result.subscribe({
        next: (data) => {
          expect(data).toBeDefined();
          done();
        },
        error: (error) => {
          done();
        }
      });
    });
  });
});
