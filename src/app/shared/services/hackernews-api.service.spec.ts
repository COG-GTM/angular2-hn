import { TestBed } from '@angular/core/testing';
import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HackerNewsAPIService]
    });
    service = TestBed.inject(HackerNewsAPIService);
    fetchSpy = spyOn(window as any, 'fetch');
  });

  afterEach(() => {
    fetchSpy.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct baseUrl', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  describe('fetchFeed', () => {
    it('should fetch feed successfully and return story array', (done) => {
      const mockStories: Story[] = [
        createMockStory(1, 'First Story'),
        createMockStory(2, 'Second Story')
      ];

      fetchSpy.and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStories)
        })
      );

      service.fetchFeed('news', 1).subscribe(
        (stories) => {
          expect(stories).toEqual(mockStories);
          expect(stories.length).toBe(2);
          expect(fetchSpy).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/news?page=1',
            undefined
          );
          done();
        },
        (error) => {
          fail('Should not have errored: ' + error);
          done();
        }
      );
    });

    it('should construct correct URL for different feed types', (done) => {
      const mockStories: Story[] = [];
      
      fetchSpy.and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStories)
        })
      );

      service.fetchFeed('newest', 3).subscribe(
        () => {
          expect(fetchSpy).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/newest?page=3',
            undefined
          );
          done();
        }
      );
    });

    it('should handle fetch errors', (done) => {
      const errorMessage = 'Network error';
      fetchSpy.and.returnValue(Promise.reject(new Error(errorMessage)));

      service.fetchFeed('news', 1).subscribe(
        () => {
          fail('Should have errored');
          done();
        },
        (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });

    it('should work with different page numbers', (done) => {
      const mockStories: Story[] = [];
      
      fetchSpy.and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStories)
        })
      );

      service.fetchFeed('show', 5).subscribe(
        () => {
          expect(fetchSpy).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/show?page=5',
            undefined
          );
          done();
        }
      );
    });
  });

  describe('fetchItemContent', () => {
    it('should fetch non-poll story successfully', (done) => {
      const mockStory = createMockStory(123, 'Test Story');
      mockStory.type = 'story';

      fetchSpy.and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStory)
        })
      );

      service.fetchItemContent(123).subscribe(
        (story) => {
          expect(story).toEqual(mockStory);
          expect(story.id).toBe(123);
          expect(fetchSpy).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/item/123',
            undefined
          );
          done();
        },
        (error) => {
          fail('Should not have errored: ' + error);
          done();
        }
      );
    });

    it('should fetch poll story and process poll options', (done) => {
      const mockPollStory = createMockStory(100, 'Poll Story');
      mockPollStory.type = 'poll';
      mockPollStory.poll = [{} as PollResult, {} as PollResult];

      const mockPollResult1: PollResult = { points: 50, content: 'Option 1' };
      const mockPollResult2: PollResult = { points: 30, content: 'Option 2' };

      fetchSpy.and.returnValues(
        Promise.resolve({
          json: () => Promise.resolve(mockPollStory)
        }),
        Promise.resolve({
          json: () => Promise.resolve(mockPollResult1)
        }),
        Promise.resolve({
          json: () => Promise.resolve(mockPollResult2)
        })
      );

      service.fetchItemContent(100).subscribe(
        (story) => {
          expect(story.type).toBe('poll');
          expect(story.id).toBe(100);
          
          setTimeout(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(3);
            expect(fetchSpy).toHaveBeenCalledWith(
              'https://node-hnapi.herokuapp.com/item/100',
              undefined
            );
            expect(fetchSpy).toHaveBeenCalledWith(
              'https://node-hnapi.herokuapp.com/item/101',
              undefined
            );
            expect(fetchSpy).toHaveBeenCalledWith(
              'https://node-hnapi.herokuapp.com/item/102',
              undefined
            );
            
            expect(story.poll[0]).toEqual(mockPollResult1);
            expect(story.poll[1]).toEqual(mockPollResult2);
            expect(story.poll_votes_count).toBe(80);
            done();
          }, 100);
        },
        (error) => {
          fail('Should not have errored: ' + error);
          done();
        }
      );
    });

    it('should handle fetch errors for item content', (done) => {
      const errorMessage = 'Item not found';
      fetchSpy.and.returnValue(Promise.reject(new Error(errorMessage)));

      service.fetchItemContent(999).subscribe(
        () => {
          fail('Should have errored');
          done();
        },
        (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });

    it('should construct correct URL for item content', (done) => {
      const mockStory = createMockStory(456, 'Test');
      mockStory.type = 'story';

      fetchSpy.and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockStory)
        })
      );

      service.fetchItemContent(456).subscribe(
        () => {
          expect(fetchSpy).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/item/456',
            undefined
          );
          done();
        }
      );
    });
  });

  describe('fetchPollContent', () => {
    it('should fetch poll content successfully', (done) => {
      const mockPollResult: PollResult = {
        points: 42,
        content: 'Poll option text'
      };

      fetchSpy.and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockPollResult)
        })
      );

      service.fetchPollContent(789).subscribe(
        (pollResult) => {
          expect(pollResult).toEqual(mockPollResult);
          expect(pollResult.points).toBe(42);
          expect(pollResult.content).toBe('Poll option text');
          expect(fetchSpy).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/item/789',
            undefined
          );
          done();
        },
        (error) => {
          fail('Should not have errored: ' + error);
          done();
        }
      );
    });

    it('should handle fetch errors for poll content', (done) => {
      const errorMessage = 'Poll not found';
      fetchSpy.and.returnValue(Promise.reject(new Error(errorMessage)));

      service.fetchPollContent(999).subscribe(
        () => {
          fail('Should have errored');
          done();
        },
        (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });

    it('should construct correct URL for poll content', (done) => {
      const mockPollResult: PollResult = { points: 10, content: 'Test' };

      fetchSpy.and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockPollResult)
        })
      );

      service.fetchPollContent(555).subscribe(
        () => {
          expect(fetchSpy).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/item/555',
            undefined
          );
          done();
        }
      );
    });
  });

  describe('fetchUser', () => {
    it('should fetch user successfully', (done) => {
      const mockUser: User = createMockUser('testuser');

      fetchSpy.and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockUser)
        })
      );

      service.fetchUser('testuser').subscribe(
        (user) => {
          expect(user).toEqual(mockUser);
          expect(user.id).toBe('testuser');
          expect(user.karma).toBe(1000);
          expect(fetchSpy).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/user/testuser',
            undefined
          );
          done();
        },
        (error) => {
          fail('Should not have errored: ' + error);
          done();
        }
      );
    });

    it('should handle fetch errors for user', (done) => {
      const errorMessage = 'User not found';
      fetchSpy.and.returnValue(Promise.reject(new Error(errorMessage)));

      service.fetchUser('nonexistent').subscribe(
        () => {
          fail('Should have errored');
          done();
        },
        (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });

    it('should construct correct URL for user', (done) => {
      const mockUser: User = createMockUser('johndoe');

      fetchSpy.and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockUser)
        })
      );

      service.fetchUser('johndoe').subscribe(
        () => {
          expect(fetchSpy).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/user/johndoe',
            undefined
          );
          done();
        }
      );
    });

    it('should work with different user IDs', (done) => {
      const mockUser: User = createMockUser('pg');

      fetchSpy.and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockUser)
        })
      );

      service.fetchUser('pg').subscribe(
        (user) => {
          expect(user.id).toBe('pg');
          done();
        }
      );
    });
  });

  function createMockStory(id: number, title: string): Story {
    const story = new Story();
    story.id = id;
    story.title = title;
    story.points = 100;
    story.user = 'testuser';
    story.time = 1234567890;
    story.time_ago = 1234567890;
    story.type = 'story';
    story.url = 'https://example.com';
    story.domain = 'example.com';
    story.comments = [];
    story.comments_count = 0;
    story.poll = [];
    story.poll_votes_count = 0;
    story.deleted = false;
    story.dead = false;
    return story;
  }

  function createMockUser(id: string): User {
    const user = new User();
    user.id = id;
    user.crated_time = 1234567890;
    user.created = '2009-02-13';
    user.karma = 1000;
    user.avg = 0.5;
    user.about = 'Test user bio';
    return user;
  }
});
