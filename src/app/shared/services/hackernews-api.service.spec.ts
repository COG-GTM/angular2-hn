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

    fetchSpy = jasmine.createSpy('fetch');
    (window as any).fetch = fetchSpy;
  });

  afterEach(() => {
    delete (window as any).fetch;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct baseUrl', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  describe('fetchFeed', () => {
    it('should fetch feed data', (done) => {
      const mockStories: Story[] = [
        { id: 1, title: 'Test Story', url: 'http://test.com' } as Story
      ];

      fetchSpy.and.returnValue(Promise.resolve({
        json: () => Promise.resolve(mockStories)
      }));

      service.fetchFeed('news', 1).subscribe(stories => {
        expect(stories).toEqual(mockStories);
        expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1', undefined);
        done();
      });
    });

    it('should handle fetch errors', (done) => {
      fetchSpy.and.returnValue(Promise.reject('Network error'));

      service.fetchFeed('news', 1).subscribe(
        () => fail('should have errored'),
        (error) => {
          expect(error).toBe('Network error');
          done();
        }
      );
    });
  });

  describe('fetchItemContent', () => {
    it('should fetch item content', (done) => {
      const mockStory: Story = {
        id: 123,
        title: 'Test Item',
        type: 'story',
        url: 'http://test.com'
      } as Story;

      fetchSpy.and.returnValue(Promise.resolve({
        json: () => Promise.resolve(mockStory)
      }));

      service.fetchItemContent(123).subscribe(story => {
        expect(story).toEqual(mockStory);
        expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/123', undefined);
        done();
      });
    });

    it('should handle poll type stories', (done) => {
      const mockPollStory: Story = {
        id: 123,
        title: 'Test Poll',
        type: 'poll',
        poll: ['Option 1', 'Option 2'] as any,
        poll_votes_count: 0
      } as Story;

      const mockPollResult: PollResult = {
        points: 10,
        content: 'Option 1'
      };

      fetchSpy.and.returnValues(
        Promise.resolve({ json: () => Promise.resolve(mockPollStory) }),
        Promise.resolve({ json: () => Promise.resolve(mockPollResult) }),
        Promise.resolve({ json: () => Promise.resolve(mockPollResult) })
      );

      service.fetchItemContent(123).subscribe(story => {
        expect(story.type).toBe('poll');
        expect(story.poll).toBeDefined();
        done();
      });
    });
  });

  describe('fetchPollContent', () => {
    it('should fetch poll content', (done) => {
      const mockPollResult: PollResult = {
        points: 15,
        content: 'Poll Option'
      };

      fetchSpy.and.returnValue(Promise.resolve({
        json: () => Promise.resolve(mockPollResult)
      }));

      service.fetchPollContent(456).subscribe(pollResult => {
        expect(pollResult).toEqual(mockPollResult);
        expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/456', undefined);
        done();
      });
    });
  });

  describe('fetchUser', () => {
    it('should fetch user data', (done) => {
      const mockUser: User = {
        id: 'testuser',
        karma: 100,
        created: '2020-01-01',
        about: 'Test user'
      } as User;

      fetchSpy.and.returnValue(Promise.resolve({
        json: () => Promise.resolve(mockUser)
      }));

      service.fetchUser('testuser').subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(fetchSpy).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/testuser', undefined);
        done();
      });
    });
  });
});
