import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';

import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { FeedComponent } from './feed.component';

const stories = (count: number): Story[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Story ${i + 1}`,
    points: 1,
    user: 'pg',
    time: 0,
    time_ago: 'now',
    type: 'link',
    url: 'https://example.com',
    comments_count: 0,
  }));

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let paramMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const setup = () => {
    TestBed.configureTestingModule({
      imports: [FeedComponent],
      providers: [
        provideRouter([]),
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { data: of({ feedType: 'news' }), paramMap } },
      ],
    });
    fixture = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
  };

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    paramMap = new BehaviorSubject(convertToParamMap({ page: '1' }));
    spyOn(window, 'scrollTo');
  });

  it('shows the loader while fetching', () => {
    api.fetchFeed.and.returnValue(new Subject<Story[]>());
    setup();
    expect(fixture.nativeElement.querySelector('app-loader')).toBeTruthy();
  });

  it('renders items and refetches when the page changes', () => {
    api.fetchFeed.and.returnValue(of(stories(30)));
    setup();
    expect(fixture.nativeElement.querySelectorAll('app-item').length).toBe(30);
    expect(fixture.nativeElement.querySelector('.more')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.prev')).toBeFalsy();

    api.fetchFeed.and.returnValue(of(stories(2)));
    paramMap.next(convertToParamMap({ page: '2' }));
    fixture.detectChanges();
    expect(api.fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(fixture.nativeElement.querySelector('ol').getAttribute('start')).toBe('31');
    expect(fixture.nativeElement.querySelector('.prev')).toBeTruthy();
  });

  it('shows an error message when the request fails', () => {
    api.fetchFeed.and.returnValue(throwError(() => new Error('boom')));
    setup();
    expect(fixture.nativeElement.querySelector('app-error-message').textContent).toContain('Could not load news stories.');
  });
});
