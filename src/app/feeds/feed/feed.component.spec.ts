import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, Subject } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let routeData: Subject<any>;
  let routeParams: Subject<any>;
  let scrollToSpy: jasmine.Spy;

  const makeStories = (count: number): Story[] =>
    Array.from({ length: count }, (_, i) => ({ id: i + 1, title: `Story ${i + 1}` } as Story));

  beforeEach(async(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    apiService.fetchFeed.and.returnValue(of(makeStories(30)));
    routeData = new Subject<any>();
    routeParams = new Subject<any>();
    scrollToSpy = spyOn(window, 'scrollTo').and.stub();

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { data: routeData.asObservable(), params: routeParams.asObservable() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  function emitRoute(feedType: string, params: any) {
    routeData.next({ feedType });
    routeParams.next(params);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => fixture.detectChanges());

    it('should set feedType from route data', () => {
      emitRoute('news', {});
      expect(component.feedType).toBe('news');
    });

    it('should default to page 1 when no page param is present', () => {
      emitRoute('news', {});
      expect(component.pageNum).toBe(1);
      expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('should parse the page param as a number', () => {
      emitRoute('ask', { page: '3' });
      expect(component.pageNum).toBe(3);
      expect(apiService.fetchFeed).toHaveBeenCalledWith('ask', 3);
    });

    it('should store fetched items', () => {
      const stories = makeStories(5);
      apiService.fetchFeed.and.returnValue(of(stories));
      emitRoute('news', {});
      expect(component.items).toEqual(stories);
      expect(component.errorMessage).toBe('');
    });

    it('should compute listStart for page 1', () => {
      emitRoute('news', {});
      expect(component.listStart).toBe(1);
    });

    it('should compute listStart for later pages', () => {
      emitRoute('news', { page: '3' });
      expect(component.listStart).toBe(61);
    });

    it('should scroll to top after loading', () => {
      emitRoute('news', {});
      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });

    it('should set errorMessage when the fetch fails', () => {
      apiService.fetchFeed.and.returnValue(throwError(new Error('boom')));
      emitRoute('show', {});
      expect(component.items).toBeUndefined();
      expect(component.errorMessage).toBe('Could not load show stories.');
      expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it('should refetch when the page param changes', () => {
      emitRoute('news', { page: '1' });
      routeParams.next({ page: '2' });
      expect(apiService.fetchFeed).toHaveBeenCalledTimes(2);
      expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 2);
      expect(component.listStart).toBe(31);
    });
  });

  describe('template', () => {
    beforeEach(() => fixture.detectChanges());

    const query = (selector: string) => fixture.nativeElement.querySelector(selector);
    const queryAll = (selector: string) => fixture.nativeElement.querySelectorAll(selector);

    it('should show the loader before items arrive', () => {
      expect(query('app-loader')).toBeTruthy();
      expect(query('app-error-message')).toBeNull();
      expect(query('ol')).toBeNull();
    });

    it('should render one list item per story', () => {
      apiService.fetchFeed.and.returnValue(of(makeStories(3)));
      emitRoute('news', {});
      fixture.detectChanges();
      expect(query('app-loader')).toBeNull();
      expect(queryAll('li.post').length).toBe(3);
      expect(query('ol').getAttribute('start')).toBe('1');
    });

    it('should show the error message on failure', () => {
      apiService.fetchFeed.and.returnValue(throwError(new Error('boom')));
      emitRoute('news', {});
      fixture.detectChanges();
      expect(query('app-loader')).toBeNull();
      expect(query('app-error-message')).toBeTruthy();
      expect(query('ol')).toBeNull();
    });

    it('should show the jobs header only for the jobs feed', () => {
      emitRoute('jobs', {});
      fixture.detectChanges();
      expect(query('.job-header')).toBeTruthy();
      expect(query('ol').classList.contains('list-margin')).toBe(false);

      emitRoute('news', {});
      fixture.detectChanges();
      expect(query('.job-header')).toBeNull();
      expect(query('ol').classList.contains('list-margin')).toBe(true);
    });

    it('should hide the Prev link on page 1 and show More when a full page is loaded', () => {
      emitRoute('news', {});
      fixture.detectChanges();
      expect(query('a.prev')).toBeNull();
      expect(query('a.more')).toBeTruthy();
    });

    it('should show Prev on later pages and hide More on a short page', () => {
      apiService.fetchFeed.and.returnValue(of(makeStories(10)));
      emitRoute('news', { page: '2' });
      fixture.detectChanges();
      expect(query('a.prev')).toBeTruthy();
      expect(query('a.more')).toBeNull();
    });
  });
});
