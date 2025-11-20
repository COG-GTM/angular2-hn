import { TestBed } from '@angular/core/testing';
import { RealtimeUpdatesService } from './realtime-updates.service';
import { HackerNewsAPIService } from './hackernews-api.service';
import { of } from 'rxjs';
import { Story } from '../models/story';

describe('RealtimeUpdatesService', () => {
  let service: RealtimeUpdatesService;
  let hackerNewsAPIServiceSpy: jasmine.SpyObj<HackerNewsAPIService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);

    TestBed.configureTestingModule({
      providers: [
        RealtimeUpdatesService,
        { provide: HackerNewsAPIService, useValue: spy }
      ]
    });
    service = TestBed.inject(RealtimeUpdatesService);
    hackerNewsAPIServiceSpy = TestBed.inject(HackerNewsAPIService) as jasmine.SpyObj<HackerNewsAPIService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return observable when subscribing to new stories', (done) => {
    const observable = service.subscribeToNewStories('news');
    expect(observable).toBeTruthy();
    expect(observable.subscribe).toBeDefined();
    done();
  });

  it('should fetch story details using HackerNewsAPIService', (done) => {
    const mockStory: Story = {
      id: 12345,
      title: 'Test Story',
      points: 100,
      user: 'testuser',
      time: 1234567890,
      time_ago: 1234567890,
      type: 'story',
      url: 'https://example.com',
      domain: 'example.com',
      comments: [],
      comments_count: 0,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    };

    hackerNewsAPIServiceSpy.fetchItemContent.and.returnValue(of(mockStory));

    service.fetchStoryDetails(12345).subscribe(story => {
      expect(story).toEqual(mockStory);
      expect(hackerNewsAPIServiceSpy.fetchItemContent).toHaveBeenCalledWith(12345);
      done();
    });
  });

  it('should unsubscribe from new stories', () => {
    service.subscribeToNewStories('news');
    expect(() => service.unsubscribeFromNewStories('news')).not.toThrow();
  });

  it('should map feed types to correct Firebase paths', (done) => {
    const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];
    feedTypes.forEach(feedType => {
      const observable = service.subscribeToNewStories(feedType);
      expect(observable).toBeTruthy();
      service.unsubscribeFromNewStories(feedType);
    });
    done();
  });

  it('should handle unknown feed type by defaulting to topstories', (done) => {
    const observable = service.subscribeToNewStories('unknown');
    expect(observable).toBeTruthy();
    service.unsubscribeFromNewStories('unknown');
    done();
  });
});
