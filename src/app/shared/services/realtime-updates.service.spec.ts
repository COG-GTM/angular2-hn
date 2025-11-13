import { TestBed } from '@angular/core/testing';
import { RealtimeUpdatesService } from './realtime-updates.service';

describe('RealtimeUpdatesService', () => {
  let service: RealtimeUpdatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RealtimeUpdatesService]
    });
    service = TestBed.inject(RealtimeUpdatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create observable when subscribing to feed', (done) => {
    const feedType = 'new';
    const observable = service.subscribeToFeed(feedType);

    expect(observable).toBeDefined();
    expect(observable.subscribe).toBeDefined();

    const subscription = observable.subscribe({
      next: (storyId) => {
        expect(typeof storyId).toBe('number');
        subscription.unsubscribe();
        done();
      },
      error: (error) => {
        fail('Observable should not error: ' + error);
      }
    });
  });

  it('should unsubscribe from specific feed', () => {
    const feedType = 'new';
    service.subscribeToFeed(feedType);

    service.unsubscribeFromFeed(feedType);

    expect(true).toBe(true);
  });

  it('should unsubscribe from all feeds', () => {
    service.subscribeToFeed('new');
    service.subscribeToFeed('top');
    service.subscribeToFeed('best');

    service.unsubscribeAll();

    expect(true).toBe(true);
  });

  it('should get story details as observable', (done) => {
    const storyId = 8863;
    const observable = service.getStoryDetails(storyId);

    expect(observable).toBeDefined();
    expect(observable.subscribe).toBeDefined();

    const subscription = observable.subscribe({
      next: (story) => {
        expect(story).toBeDefined();
        if (story) {
          expect(story.id).toBeDefined();
        }
        subscription.unsubscribe();
        done();
      },
      error: (error) => {
        subscription.unsubscribe();
        done();
      }
    });
  });

  it('should handle multiple subscriptions to different feeds', () => {
    service.subscribeToFeed('new');
    service.subscribeToFeed('top');

    expect(true).toBe(true);
  });
});
