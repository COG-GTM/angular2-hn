import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let routeData: BehaviorSubject<any>;
  let routeParams: BehaviorSubject<Params>;

  function stories(count: number): Story[] {
    return Array.from({ length: count }, (_, i) => ({ id: i + 1, title: `Story ${i + 1}` } as Story));
  }

  function setup(feedType: string, params: Params) {
    routeData.next({ feedType });
    routeParams.next(params);
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(async(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    routeData = new BehaviorSubject<any>({});
    routeParams = new BehaviorSubject<Params>({});
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { data: routeData, params: routeParams } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  it('should create', () => {
    api.fetchFeed.and.returnValue(of([]));
    setup('news', { page: '1' });

    expect(component).toBeTruthy();
  });

  it('should fetch the feed type and page from the route', () => {
    api.fetchFeed.and.returnValue(of(stories(3)));
    setup('show', { page: '3' });

    expect(api.fetchFeed).toHaveBeenCalledWith('show', 3);
    expect(component.feedType).toBe('show');
    expect(component.pageNum).toBe(3);
  });

  it('should default to page 1 when the route has no page', () => {
    api.fetchFeed.and.returnValue(of(stories(1)));
    setup('news', {});

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(component.listStart).toBe(1);
  });

  it('should render one item per story numbered from the page offset', () => {
    api.fetchFeed.and.returnValue(of(stories(30)));
    setup('news', { page: '2' });

    const list = element.querySelector('ol');
    expect(element.querySelectorAll('li.post item').length).toBe(30);
    expect(component.listStart).toBe(31);
    expect(list.getAttribute('start')).toBe('31');
    expect(list.classList).toContain('list-margin');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should show prev and more links when not on the first page of a full feed', () => {
    api.fetchFeed.and.returnValue(of(stories(30)));
    setup('news', { page: '2' });

    expect(element.querySelector('a.prev').getAttribute('href')).toBe('/news/1');
    expect(element.querySelector('a.more').getAttribute('href')).toBe('/news/3');
  });

  it('should hide prev on the first page and more on a partial page', () => {
    api.fetchFeed.and.returnValue(of(stories(12)));
    setup('news', { page: '1' });

    expect(element.querySelector('a.prev')).toBeNull();
    expect(element.querySelector('a.more')).toBeNull();
  });

  it('should show the YC jobs header for the jobs feed', () => {
    api.fetchFeed.and.returnValue(of(stories(5)));
    setup('jobs', { page: '1' });

    expect(element.querySelector('.job-header').textContent).toContain('Y Combinator');
    expect(element.querySelector('ol').classList).not.toContain('list-margin');
  });

  it('should show the loader while the feed is loading', () => {
    api.fetchFeed.and.returnValue(NEVER);
    setup('news', { page: '1' });

    expect(element.querySelector('app-loader')).not.toBeNull();
    expect(element.querySelector('ol')).toBeNull();
  });

  it('should show an error message when the feed fails to load', () => {
    api.fetchFeed.and.returnValue(throwError(new Error('offline')));
    setup('ask', { page: '1' });

    expect(component.errorMessage).toBe('Could not load ask stories.');
    expect(element.querySelector('app-error-message')).not.toBeNull();
    expect(element.querySelector('app-loader')).toBeNull();
  });

  it('should refetch when the page param changes', () => {
    api.fetchFeed.and.returnValue(of(stories(30)));
    setup('newest', { page: '1' });

    routeParams.next({ page: '2' });

    expect(api.fetchFeed.calls.mostRecent().args).toEqual(['newest', 2]);
    expect(component.listStart).toBe(31);
  });
});
