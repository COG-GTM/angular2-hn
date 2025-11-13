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

  it('should initialize Firebase when initialize is called', () => {
    service.initialize();
    expect(service.initialized).toBe(true);
  });

  it('should not reinitialize if already initialized', () => {
    service.initialize();
    const firstInitState = service.initialized;
    service.initialize();
    expect(service.initialized).toBe(firstInitState);
  });

  it('should return correct feed path for news feed', () => {
    const feedPath = service.getFeedPath('news');
    expect(feedPath).toBe('v0/topstories');
  });

  it('should return correct feed path for newest feed', () => {
    const feedPath = service.getFeedPath('newest');
    expect(feedPath).toBe('v0/newstories');
  });

  it('should return correct feed path for show feed', () => {
    const feedPath = service.getFeedPath('show');
    expect(feedPath).toBe('v0/showstories');
  });

  it('should return correct feed path for ask feed', () => {
    const feedPath = service.getFeedPath('ask');
    expect(feedPath).toBe('v0/askstories');
  });

  it('should return correct feed path for jobs feed', () => {
    const feedPath = service.getFeedPath('jobs');
    expect(feedPath).toBe('v0/jobstories');
  });

  it('should return default feed path for unknown feed type', () => {
    const feedPath = service.getFeedPath('unknown');
    expect(feedPath).toBe('v0/topstories');
  });

  it('should extract domain from URL correctly', () => {
    const domain = service.extractDomain('https://www.example.com/path/to/page');
    expect(domain).toBe('example.com');
  });

  it('should handle URL without www prefix', () => {
    const domain = service.extractDomain('https://example.com/path');
    expect(domain).toBe('example.com');
  });

  it('should return empty string for invalid URL', () => {
    const domain = service.extractDomain('not-a-url');
    expect(domain).toBe('');
  });

  it('should return empty string for null URL', () => {
    const domain = service.extractDomain(null);
    expect(domain).toBe('');
  });

  it('should calculate time ago correctly', () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const pastTime = currentTime - 3600;
    const timeAgo = service.calculateTimeAgo(pastTime);
    expect(timeAgo).toBeGreaterThanOrEqual(3600);
    expect(timeAgo).toBeLessThan(3700);
  });

  it('should transform Firebase story correctly', () => {
    const firebaseStory = {
      id: 123,
      title: 'Test Story',
      score: 100,
      by: 'testuser',
      time: Math.floor(Date.now() / 1000),
      type: 'story',
      url: 'https://example.com',
      descendants: 50,
      deleted: false,
      dead: false
    };

    const transformedStory = service.transformFirebaseStory(firebaseStory);

    expect(transformedStory.id).toBe(123);
    expect(transformedStory.title).toBe('Test Story');
    expect(transformedStory.points).toBe(100);
    expect(transformedStory.user).toBe('testuser');
    expect(transformedStory.url).toBe('https://example.com');
    expect(transformedStory.domain).toBe('example.com');
    expect(transformedStory.comments_count).toBe(50);
    expect(transformedStory.deleted).toBe(false);
    expect(transformedStory.dead).toBe(false);
  });

  it('should handle Firebase story without optional fields', () => {
    const firebaseStory = {
      id: 456,
      title: 'Another Test',
      score: 50,
      by: 'anotheruser',
      time: Math.floor(Date.now() / 1000),
      type: 'story'
    };

    const transformedStory = service.transformFirebaseStory(firebaseStory);

    expect(transformedStory.id).toBe(456);
    expect(transformedStory.comments_count).toBe(0);
    expect(transformedStory.deleted).toBe(false);
    expect(transformedStory.dead).toBe(false);
    expect(transformedStory.domain).toBe('');
  });

  it('should create observable for subscribeToTopStories', () => {
    service.initialize();
    const observable = service.subscribeToTopStories('news');
    expect(observable).toBeTruthy();
    expect(observable.subscribe).toBeDefined();
  });

  it('should create observable for subscribeToStory', () => {
    service.initialize();
    const observable = service.subscribeToStory(123);
    expect(observable).toBeTruthy();
    expect(observable.subscribe).toBeDefined();
  });
});
