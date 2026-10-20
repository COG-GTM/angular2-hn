import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { ItemComponent } from '../item/item.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';

function makeStories(count: number, startId = 1): Story[] {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    title: `Story ${startId + i}`,
    points: 10,
    user: 'alice',
    time: 0,
    time_ago: '1 hour ago',
    type: 'story',
    url: `https://example.com/${startId + i}`,
    domain: 'example.com',
    comments_count: 2,
  } as any));
}

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let routeData: BehaviorSubject<any>;
  let routeParams: BehaviorSubject<any>;

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    routeData = new BehaviorSubject({ feedType: 'news' });
    routeParams = new BehaviorSubject({ page: '1' });
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
      declarations: [FeedComponent, ItemComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { data: routeData, params: routeParams } },
        {
          provide: SettingsService,
          useValue: { settings: { openLinkInNewTab: false, titleFontSize: '16', listSpacing: '0' } },
        },
      ],
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  function el(): HTMLElement {
    return fixture.nativeElement;
  }

  it('shows the loader while the feed is loading', () => {
    api.fetchFeed.and.returnValue(new Subject<Story[]>());
    fixture.detectChanges();
    expect(el().querySelector('app-loader')).toBeTruthy();
    expect(el().querySelector('ol')).toBeNull();
  });

  it('fetches the feed type from route data and page from params', () => {
    api.fetchFeed.and.returnValue(of([]));
    routeParams.next({ page: '2' });
    fixture.detectChanges();
    expect(api.fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(2);
  });

  it('defaults to page 1 when no page param is present', () => {
    api.fetchFeed.and.returnValue(of([]));
    routeParams.next({});
    fixture.detectChanges();
    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('renders one item per story', () => {
    api.fetchFeed.and.returnValue(of(makeStories(3)));
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.directive(ItemComponent));
    expect(items.length).toBe(3);
    expect(items[0].componentInstance.item.title).toBe('Story 1');
    expect(el().querySelector('app-loader')).toBeNull();
    expect(el().textContent).toContain('Story 3');
  });

  it('scrolls to the top once the feed completes', () => {
    api.fetchFeed.and.returnValue(of(makeStories(1)));
    fixture.detectChanges();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  describe('pagination', () => {
    it('on page 1 with a full page shows "More" but not "Prev"', () => {
      api.fetchFeed.and.returnValue(of(makeStories(30)));
      fixture.detectChanges();

      expect(component.listStart).toBe(1);
      expect(el().querySelector('ol').getAttribute('start')).toBe('1');
      expect(el().querySelector('a.prev')).toBeNull();
      const more = el().querySelector('a.more');
      expect(more).toBeTruthy();
      expect(more.getAttribute('href')).toBe('/news/2');
    });

    it('on page 3 continues the ranking and links both ways', () => {
      api.fetchFeed.and.returnValue(of(makeStories(30, 61)));
      routeParams.next({ page: '3' });
      fixture.detectChanges();

      expect(component.listStart).toBe(61);
      expect(el().querySelector('ol').getAttribute('start')).toBe('61');
      expect(el().querySelector('a.prev').getAttribute('href')).toBe('/news/2');
      expect(el().querySelector('a.more').getAttribute('href')).toBe('/news/4');
    });

    it('hides "More" on a partial last page', () => {
      api.fetchFeed.and.returnValue(of(makeStories(12)));
      routeParams.next({ page: '2' });
      fixture.detectChanges();

      expect(el().querySelector('a.more')).toBeNull();
      expect(el().querySelector('a.prev')).toBeTruthy();
    });

    it('refetches when the page param changes', () => {
      api.fetchFeed.and.returnValue(of(makeStories(30)));
      fixture.detectChanges();
      routeParams.next({ page: '2' });
      fixture.detectChanges();

      expect(api.fetchFeed.calls.allArgs()).toEqual([['news', 1], ['news', 2]]);
      expect(component.listStart).toBe(31);
    });
  });

  describe('feed types', () => {
    it('shows the YC jobs header for the jobs feed', () => {
      routeData.next({ feedType: 'jobs' });
      api.fetchFeed.and.returnValue(of(makeStories(2)));
      fixture.detectChanges();

      expect(el().querySelector('.job-header').textContent).toContain('Y Combinator');
      expect(el().querySelector('ol').classList).not.toContain('list-margin');
    });

    it('does not show the jobs header for other feeds', () => {
      api.fetchFeed.and.returnValue(of(makeStories(2)));
      fixture.detectChanges();
      expect(el().querySelector('.job-header')).toBeNull();
      expect(el().querySelector('ol').classList).toContain('list-margin');
    });
  });

  it('shows an error message when the feed fails to load', () => {
    routeData.next({ feedType: 'ask' });
    api.fetchFeed.and.returnValue(throwError(new Error('offline')));
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load ask stories.');
    expect(el().querySelector('app-loader')).toBeNull();
    expect(el().querySelector('app-error-message').textContent).toContain('Could not load ask stories.');
  });
});
