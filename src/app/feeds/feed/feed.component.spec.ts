import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { FeedComponent } from './feed.component';

describe('FeedComponent', () => {
  const story = (id: number): Story =>
    ({
      id,
      title: `Story ${id}`,
      type: 'story',
      url: `https://example.com/${id}`,
      domain: 'example.com',
      user: 'pg',
      points: 10,
      time_ago: '1 hour ago',
      comments_count: 3,
    }) as unknown as Story;

  let data: BehaviorSubject<{ feedType: string }>;
  let params: BehaviorSubject<{ page: string }>;
  let hackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
  let fixture: ComponentFixture<FeedComponent>;

  beforeEach(async () => {
    data = new BehaviorSubject({ feedType: 'news' });
    params = new BehaviorSubject({ page: '1' });
    hackerNewsAPIService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    hackerNewsAPIService.fetchFeed.and.returnValue(of([story(1), story(2)]));

    await TestBed.configureTestingModule({
      imports: [FeedComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { data, params } },
        { provide: HackerNewsAPIService, useValue: hackerNewsAPIService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
  });

  it('renders the stories of the current feed', () => {
    expect(hackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(fixture.nativeElement.querySelectorAll('app-item').length).toBe(2);
    expect(fixture.componentInstance.listStart).toBe(1);
  });

  it('reloads the feed and offsets the ranking when the page changes', () => {
    hackerNewsAPIService.fetchFeed.and.returnValue(of([story(3)]));

    params.next({ page: '3' });
    fixture.detectChanges();

    expect(hackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 3);
    expect(fixture.componentInstance.listStart).toBe(61);
  });

  it('shows an error message when the feed cannot be loaded', () => {
    hackerNewsAPIService.fetchFeed.and.returnValue(throwError(() => new Error('offline')));

    params.next({ page: '2' });
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage).toBe('Could not load news stories.');
    expect(fixture.nativeElement.querySelector('app-error-message').textContent).toContain(
      'Could not load news stories.'
    );
  });
});
