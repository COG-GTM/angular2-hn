import { TestBed } from '@angular/core/testing';
import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let originalFetch: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HackerNewsAPIService]
    });
    service = TestBed.inject(HackerNewsAPIService);
    
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have baseUrl set to Hacker News API', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  describe('fetchFeed', () => {
    it('should fetch feed with correct URL for news feed', (done) => {
      const mockStories = [
        { id: 1, title: 'Story 1' },
        { id: 2, title: 'Story 2' }
      ];

      global.fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStories)
        } as Response)
      );

      service.fetchFeed('news', 1).subscribe(stories => {
        expect(stories).toEqual(mockStories as any);
        expect(global.fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/news?page=1',
          undefined
        );
        done();
      });
    });

    it('should fetch feed with correct URL for different feed types', (done) => {
      global.fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve([])
        } as Response)
      );

      service.fetchFeed('newest', 2).subscribe(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/newest?page=2',
          undefined
        );
        done();
      });
    });

    it('should handle fetch errors', (done) => {
      global.fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.reject(new Error('Network error'))
      );

      service.fetchFeed('news', 1).subscribe(
        () => fail('should have errored'),
        error => {
          expect(error.message).toBe('Network error');
          done();
        }
      );
    });
  });

  describe('fetchItemContent', () => {
    it('should fetch item content with correct URL', (done) => {
      const mockItem = {
        id: 123,
        title: 'Test Item',
        type: 'story',
        url: 'https://example.com'
      };

      global.fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockItem)
        } as Response)
      );

      service.fetchItemContent(123).subscribe(item => {
        expect(item.id).toBe(123);
        expect(global.fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/item/123',
          undefined
        );
        done();
      });
    });

    it('should handle poll items and fetch poll results', (done) => {
      const mockPollItem = {
        id: 123,
        title: 'Poll Question',
        type: 'poll',
        poll: [{}, {}],
        poll_votes_count: 0
      };

      const mockPollOption1 = { id: 124, text: 'Option 1', points: 10 };
      const mockPollOption2 = { id: 125, text: 'Option 2', points: 20 };

      let fetchCallCount = 0;
      global.fetch = jasmine.createSpy('fetch').and.callFake((url: string) => {
        fetchCallCount++;
        if (fetchCallCount === 1) {
          return Promise.resolve({
            json: () => Promise.resolve(mockPollItem)
          } as Response);
        } else if (fetchCallCount === 2) {
          return Promise.resolve({
            json: () => Promise.resolve(mockPollOption1)
          } as Response);
        } else {
          return Promise.resolve({
            json: () => Promise.resolve(mockPollOption2)
          } as Response);
        }
      });

      service.fetchItemContent(123).subscribe(item => {
        expect(item.type).toBe('poll');
        expect(item.poll.length).toBe(2);
        done();
      });
    });

    it('should handle fetch errors for item content', (done) => {
      global.fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.reject(new Error('Item not found'))
      );

      service.fetchItemContent(999).subscribe(
        () => fail('should have errored'),
        error => {
          expect(error.message).toBe('Item not found');
          done();
        }
      );
    });
  });

  describe('fetchUser', () => {
    it('should fetch user with correct URL', (done) => {
      const mockUser = {
        id: 'testuser',
        created: '2020-01-01',
        karma: 100
      };

      global.fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockUser)
        } as Response)
      );

      service.fetchUser('testuser').subscribe(user => {
        expect(user.id).toBe('testuser');
        expect(global.fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/user/testuser',
          undefined
        );
        done();
      });
    });

    it('should handle fetch errors for user', (done) => {
      global.fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.reject(new Error('User not found'))
      );

      service.fetchUser('nonexistent').subscribe(
        () => fail('should have errored'),
        error => {
          expect(error.message).toBe('User not found');
          done();
        }
      );
    });
  });

  describe('fetchPollContent', () => {
    it('should fetch poll content with correct URL', (done) => {
      const mockPoll = {
        content: 'Poll Option',
        points: 15
      };

      global.fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockPoll)
        } as Response)
      );

      service.fetchPollContent(124).subscribe(poll => {
        expect(poll.content).toBe('Poll Option');
        expect(global.fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/item/124',
          undefined
        );
        done();
      });
    });
  });
});
