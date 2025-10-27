import { TestBed } from '@angular/core/testing';
import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let originalFetch: any;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HackerNewsAPIService]
    });
    service = TestBed.inject(HackerNewsAPIService);
    
    originalFetch = (global as any).fetch;
  });
  
  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with correct baseUrl', () => {
      expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
    });
  });

  describe('fetchFeed()', () => {
    it('should fetch news feed successfully', (done) => {
      const mockStories: Story[] = [
        { id: 1, title: 'Test Story', points: 100, user: 'testuser', time: 123456, time_ago: 1, type: 'story', url: 'http://test.com', domain: 'test.com', comments: [], comments_count: 5, poll: [], poll_votes_count: 0, deleted: false, dead: false }
      ];

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStories)
        })
      );

      service.fetchFeed('news', 1).subscribe(stories => {
        expect(stories).toEqual(mockStories);
        expect((global as any).fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/news?page=1',
          undefined
        );
        done();
      });
    });

    it('should fetch newest feed with pagination', (done) => {
      const mockStories: Story[] = [];

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStories)
        })
      );

      service.fetchFeed('newest', 2).subscribe(stories => {
        expect(stories).toEqual(mockStories);
        expect((global as any).fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/newest?page=2',
          undefined
        );
        done();
      });
    });

    it('should fetch show feed', (done) => {
      const mockStories: Story[] = [];

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStories)
        })
      );

      service.fetchFeed('show', 1).subscribe(stories => {
        expect((global as any).fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/show?page=1',
          undefined
        );
        done();
      });
    });

    it('should fetch ask feed', (done) => {
      const mockStories: Story[] = [];

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStories)
        })
      );

      service.fetchFeed('ask', 1).subscribe(stories => {
        expect((global as any).fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/ask?page=1',
          undefined
        );
        done();
      });
    });

    it('should fetch jobs feed', (done) => {
      const mockStories: Story[] = [];

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStories)
        })
      );

      service.fetchFeed('jobs', 1).subscribe(stories => {
        expect((global as any).fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/jobs?page=1',
          undefined
        );
        done();
      });
    });

    it('should handle fetch errors', (done) => {
      const errorMessage = 'Network error';

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.reject(new Error(errorMessage))
      );

      service.fetchFeed('news', 1).subscribe(
        () => fail('should have errored'),
        error => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });
  });

  describe('fetchItemContent()', () => {
    it('should fetch regular story content', (done) => {
      const mockStory: Story = {
        id: 123,
        title: 'Test Story',
        points: 100,
        user: 'testuser',
        time: 123456,
        time_ago: 1,
        type: 'story',
        url: 'http://test.com',
        domain: 'test.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false
      };

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStory)
        })
      );

      service.fetchItemContent(123).subscribe(story => {
        expect(story).toEqual(mockStory);
        expect((global as any).fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/item/123',
          undefined
        );
        done();
      });
    });

    it('should fetch poll story and poll options', (done) => {
      const mockPollStory: Story = {
        id: 456,
        title: 'Poll Story',
        points: 50,
        user: 'polluser',
        time: 123456,
        time_ago: 1,
        type: 'poll',
        url: '',
        domain: '',
        comments: [],
        comments_count: 3,
        poll: [
          { points: 0, content: '' },
          { points: 0, content: '' }
        ],
        poll_votes_count: 0,
        deleted: false,
        dead: false
      };

      const mockPollOption1: PollResult = {
        points: 25,
        content: 'Option 1'
      };

      const mockPollOption2: PollResult = {
        points: 30,
        content: 'Option 2'
      };

      let fetchCallCount = 0;
      (global as any).fetch = jasmine.createSpy('fetch').and.callFake((url: string) => {
        fetchCallCount++;
        if (fetchCallCount === 1) {
          return Promise.resolve({
            json: () => Promise.resolve(mockPollStory)
          });
        } else if (fetchCallCount === 2) {
          return Promise.resolve({
            json: () => Promise.resolve(mockPollOption1)
          });
        } else {
          return Promise.resolve({
            json: () => Promise.resolve(mockPollOption2)
          });
        }
      });

      service.fetchItemContent(456).subscribe(story => {
        expect(story.type).toBe('poll');
        expect(story.poll.length).toBe(2);
        
        setTimeout(() => {
          expect(story.poll_votes_count).toBe(55);
          expect((global as any).fetch).toHaveBeenCalledTimes(3);
          done();
        }, 100);
      });
    });

    it('should handle errors when fetching item content', (done) => {
      const errorMessage = 'Item not found';

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.reject(new Error(errorMessage))
      );

      service.fetchItemContent(999).subscribe(
        () => fail('should have errored'),
        error => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });
  });

  describe('fetchPollContent()', () => {
    it('should fetch poll option content', (done) => {
      const mockPollOption: PollResult = {
        points: 42,
        content: 'Poll Option Text'
      };

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockPollOption)
        })
      );

      service.fetchPollContent(789).subscribe(pollResult => {
        expect(pollResult).toEqual(mockPollOption);
        expect((global as any).fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/item/789',
          undefined
        );
        done();
      });
    });

    it('should handle errors when fetching poll content', (done) => {
      const errorMessage = 'Poll option not found';

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.reject(new Error(errorMessage))
      );

      service.fetchPollContent(999).subscribe(
        () => fail('should have errored'),
        error => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });
  });

  describe('fetchUser()', () => {
    it('should fetch user data', (done) => {
      const mockUser: User = {
        id: 'testuser',
        crated_time: 123456,
        created: '2020-01-01',
        karma: 1000,
        avg: 10.5,
        about: 'Test user bio'
      };

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockUser)
        })
      );

      service.fetchUser('testuser').subscribe(user => {
        expect(user).toEqual(mockUser);
        expect((global as any).fetch).toHaveBeenCalledWith(
          'https://node-hnapi.herokuapp.com/user/testuser',
          undefined
        );
        done();
      });
    });

    it('should handle errors when fetching user', (done) => {
      const errorMessage = 'User not found';

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.reject(new Error(errorMessage))
      );

      service.fetchUser('nonexistent').subscribe(
        () => fail('should have errored'),
        error => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });
  });

  describe('lazyFetch cancellation', () => {
    it('should cancel fetch when unsubscribed before completion', (done) => {
      let cancelToken = false;
      const mockData = { test: 'data' };

      (global as any).fetch = jasmine.createSpy('fetch').and.callFake(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (!cancelToken) {
              resolve({
                json: () => Promise.resolve(mockData)
              });
            }
          }, 100);
        });
      });

      const subscription = service.fetchFeed('news', 1).subscribe(
        () => fail('should not emit data after unsubscribe'),
        () => fail('should not error'),
        () => fail('should not complete')
      );

      setTimeout(() => {
        subscription.unsubscribe();
        cancelToken = true;
      }, 50);

      setTimeout(() => {
        done();
      }, 150);
    });

    it('should complete successfully when not cancelled', (done) => {
      const mockStories: Story[] = [
        { id: 1, title: 'Test', points: 10, user: 'test', time: 123, time_ago: 1, type: 'story', url: '', domain: '', comments: [], comments_count: 0, poll: [], poll_votes_count: 0, deleted: false, dead: false }
      ];

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStories)
        })
      );

      service.fetchFeed('news', 1).subscribe(
        data => {
          expect(data).toEqual(mockStories);
        },
        () => fail('should not error'),
        () => {
          done();
        }
      );
    });

    it('should not emit data if cancelled during json parsing', (done) => {
      let emitted = false;
      const mockStories: Story[] = [];

      (global as any).fetch = jasmine.createSpy('fetch').and.returnValue(
        Promise.resolve({
          json: () => new Promise((resolve) => {
            setTimeout(() => resolve(mockStories), 100);
          })
        })
      );

      const subscription = service.fetchFeed('news', 1).subscribe(
        () => {
          emitted = true;
        }
      );

      setTimeout(() => {
        subscription.unsubscribe();
      }, 50);

      setTimeout(() => {
        expect(emitted).toBe(false);
        done();
      }, 150);
    });
  });
});
