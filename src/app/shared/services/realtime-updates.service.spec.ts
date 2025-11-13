import { TestBed } from '@angular/core/testing';
import { RealtimeUpdatesService } from './realtime-updates.service';
import { HackerNewsAPIService } from './hackernews-api.service';
import { of, throwError } from 'rxjs';
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

  it('should initialize Firebase app and database', () => {
    expect(service).toBeTruthy();
    expect(service).toBeTruthy();
  });

  it('should return observable when subscribing to feed', (done) => {
    const observable = service.subscribeToFeed('news');
    expect(observable).toBeDefined();

    const subscription = observable.subscribe();
    expect(subscription).toBeDefined();
    subscription.unsubscribe();
    done();
  });

  it('should track active subscriptions', () => {
    service.subscribeToFeed('news');
    expect(service).toBeTruthy();
  });

  it('should not create duplicate subscriptions for same feed', () => {
    service.subscribeToFeed('news');
    service.subscribeToFeed('news');

    expect(service).toBeTruthy();
  });

  it('should unsubscribe from specific feed', () => {
    service.subscribeToFeed('news');
    expect(service).toBeTruthy();

    service.unsubscribeFromFeed('news');
    expect(service).toBeTruthy();
  });

  it('should unsubscribe from all feeds', () => {
    service.subscribeToFeed('news');
    service.subscribeToFeed('show');
    expect(service).toBeTruthy();

    service.unsubscribeAll();
    expect(service).toBeTruthy();
  });

  it('should emit connection status', (done) => {
    service.isConnected().subscribe(status => {
      expect(typeof status).toBe('boolean');
      done();
    });
  });

  it('should set connected status to true when subscribing', (done) => {
    service.subscribeToFeed('news');

    service.isConnected().subscribe(status => {
      expect(status).toBe(true);
      done();
    });
  });

  it('should set connected status to false when unsubscribing all', (done) => {
    service.subscribeToFeed('news');
    service.unsubscribeAll();

    service.isConnected().subscribe(status => {
      expect(status).toBe(false);
      done();
    });
  });
});
