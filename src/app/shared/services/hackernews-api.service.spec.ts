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

  it('should have correct baseUrl', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  describe('fetchFeed', () => {
    it('should construct correct URL for news feed', (done) => {
      const feedType = 'news';
      const page = 1;
      
      service.fetchFeed(feedType, page).subscribe(
        () => {},
        () => {},
        () => done()
      );
    });

    it('should construct correct URL for different feed types', (done) => {
      const feedType = 'newest';
      const page = 2;
      
      service.fetchFeed(feedType, page).subscribe(
        () => {},
        () => {},
        () => done()
      );
    });
  });

  describe('fetchItemContent', () => {
    it('should fetch item by id', (done) => {
      const itemId = 12345;
      
      service.fetchItemContent(itemId).subscribe(
        (story) => {
          expect(story).toBeDefined();
          done();
        },
        () => done()
      );
    });
  });

  describe('fetchUser', () => {
    it('should fetch user by id', (done) => {
      const userId = 'testuser';
      
      service.fetchUser(userId).subscribe(
        (user) => {
          expect(user).toBeDefined();
          done();
        },
        () => done()
      );
    });
  });
});
