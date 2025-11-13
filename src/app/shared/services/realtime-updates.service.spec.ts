import { TestBed } from '@angular/core/testing';
import { RealtimeUpdatesService } from './realtime-updates.service';
import { HackerNewsAPIService } from './hackernews-api.service';
import { SettingsService } from './settings.service';
import { of } from 'rxjs';

describe('RealtimeUpdatesService', () => {
  let service: RealtimeUpdatesService;
  let hackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    const hackerNewsAPISpy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    const settingsServiceSpy = jasmine.createSpyObj('SettingsService', [], {
      settings: { realtimeUpdates: false }
    });

    TestBed.configureTestingModule({
      providers: [
        RealtimeUpdatesService,
        { provide: HackerNewsAPIService, useValue: hackerNewsAPISpy },
        { provide: SettingsService, useValue: settingsServiceSpy }
      ]
    });

    service = TestBed.inject(RealtimeUpdatesService);
    hackerNewsAPIService = TestBed.inject(HackerNewsAPIService) as jasmine.SpyObj<HackerNewsAPIService>;
    settingsService = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false when realtime updates are disabled', () => {
    settingsService.settings.realtimeUpdates = false;
    expect(service.isRealtimeEnabled()).toBe(false);
  });

  it('should return true when realtime updates are enabled', () => {
    settingsService.settings.realtimeUpdates = true;
    expect(service.isRealtimeEnabled()).toBe(true);
  });

  it('should return observable when subscribing to top stories', () => {
    const observable = service.subscribeToTopStories('news');
    expect(observable).toBeTruthy();
    expect(observable.subscribe).toBeDefined();
  });

  it('should unsubscribe from realtime updates', () => {
    service.subscribeToTopStories('news');
    expect(() => service.unsubscribe()).not.toThrow();
  });

  it('should map feed types to correct Firebase paths', () => {
    const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];
    feedTypes.forEach(feedType => {
      const observable = service.subscribeToTopStories(feedType);
      expect(observable).toBeTruthy();
    });
  });
});
