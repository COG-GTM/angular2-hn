import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, Subject } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Story } from '../shared/models/story';
import { Settings } from '../shared/models/settings';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let settings: Settings;
  let routeParams: Subject<any>;
  let scrollToSpy: jasmine.Spy;

  const makeItem = (overrides: Partial<Story> = {}): Story => ({
    id: 42,
    title: 'Story 42',
    points: 100,
    user: 'pg',
    time_ago: '1 hour ago',
    type: 'link',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments: [],
    comments_count: 0,
    ...overrides,
  } as any as Story);

  beforeEach(async(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    apiService.fetchItemContent.and.returnValue(of(makeItem()));
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };
    routeParams = new Subject<any>();
    scrollToSpy = spyOn(window, 'scrollTo').and.stub();

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: SettingsService, useValue: { settings } },
        { provide: ActivatedRoute, useValue: { params: routeParams.asObservable() } },
        { provide: Location, useValue: location },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read settings from SettingsService', () => {
    expect(component.settings).toBe(settings);
  });

  describe('ngOnInit', () => {
    beforeEach(() => fixture.detectChanges());

    it('should not fetch before route params emit', () => {
      expect(apiService.fetchItemContent).not.toHaveBeenCalled();
    });

    it('should fetch the item using the numeric id param', () => {
      routeParams.next({ id: '42' });
      expect(apiService.fetchItemContent).toHaveBeenCalledWith(42);
    });

    it('should store the fetched item', () => {
      const item = makeItem({ title: 'Fetched' });
      apiService.fetchItemContent.and.returnValue(of(item));
      routeParams.next({ id: '42' });
      expect(component.item).toBe(item);
      expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage when the fetch fails', () => {
      apiService.fetchItemContent.and.returnValue(throwError(new Error('boom')));
      routeParams.next({ id: '42' });
      expect(component.item).toBeUndefined();
      expect(component.errorMessage).toBe('Could not load item comments.');
    });

    it('should refetch when the id param changes', () => {
      routeParams.next({ id: '1' });
      routeParams.next({ id: '2' });
      expect(apiService.fetchItemContent).toHaveBeenCalledTimes(2);
      expect(apiService.fetchItemContent).toHaveBeenCalledWith(2);
    });

    it('should scroll to top on init', () => {
      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('goBack', () => {
    it('should navigate back via Location', () => {
      component.goBack();
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('hasUrl', () => {
    it('should be true for absolute http(s) urls', () => {
      component.item = makeItem({ url: 'https://example.com' });
      expect(component.hasUrl).toBe(true);
    });

    it('should be false for relative item urls', () => {
      component.item = makeItem({ url: 'item?id=42' });
      expect(component.hasUrl).toBe(false);
    });
  });

  describe('template', () => {
    beforeEach(() => fixture.detectChanges());

    const query = (selector: string) => fixture.nativeElement.querySelector(selector);
    const queryAll = (selector: string) => fixture.nativeElement.querySelectorAll(selector);

    function emitItem(item: Story) {
      apiService.fetchItemContent.and.returnValue(of(item));
      routeParams.next({ id: String(item.id) });
      fixture.detectChanges();
    }

    it('should show the loader before the item arrives', () => {
      expect(query('app-loader')).toBeTruthy();
      expect(query('app-error-message')).toBeNull();
      expect(query('.item')).toBeNull();
    });

    it('should show the error message on failure', () => {
      apiService.fetchItemContent.and.returnValue(throwError(new Error('boom')));
      routeParams.next({ id: '42' });
      fixture.detectChanges();
      expect(query('app-loader')).toBeNull();
      expect(query('app-error-message')).toBeTruthy();
      expect(query('.item')).toBeNull();
    });

    it('should render the item title, domain, points and author', () => {
      emitItem(makeItem());
      expect(query('app-loader')).toBeNull();
      const laptop = query('.laptop');
      expect(laptop.querySelector('a.title').textContent.trim()).toBe('Story 42');
      expect(laptop.querySelector('a.title').getAttribute('href')).toBe('https://example.com/story');
      expect(laptop.querySelector('.domain').textContent.trim()).toBe('(example.com)');
      expect(laptop.querySelector('.subtext').textContent).toContain('100 points by');
      expect(laptop.querySelector('.subtext').textContent).toContain('pg');
    });

    it('should link the title internally when the item has no external url', () => {
      emitItem(makeItem({ url: 'item?id=42', domain: undefined }));
      const title = query('.laptop a.title');
      expect(title.getAttribute('href')).toBe('/item/42');
      expect(query('.laptop .domain')).toBeNull();
    });

    it('should open external links in a new tab when the setting is enabled', () => {
      settings.openLinkInNewTab = true;
      emitItem(makeItem());
      const title = query('.laptop a.title');
      expect(title.getAttribute('target')).toBe('_blank');
      expect(title.getAttribute('rel')).toBe('noopener');
    });

    it('should not set target or rel when the new-tab setting is disabled', () => {
      emitItem(makeItem());
      const title = query('.laptop a.title');
      expect(title.hasAttribute('target')).toBe(false);
      expect(title.hasAttribute('rel')).toBe(false);
    });

    it('should hide points and comment link for jobs', () => {
      emitItem(makeItem({ type: 'job' }));
      const subtext = query('.laptop .subtext');
      expect(subtext.textContent).not.toContain('points by');
      expect(subtext.querySelector('.item-details')).toBeNull();
      expect(query('.laptop').classList.contains('item-header')).toBe(true);
    });

    it('should render one comment per top-level comment', () => {
      emitItem(makeItem({ comments: [{ id: 1 }, { id: 2 }, { id: 3 }] as any, comments_count: 3 }));
      expect(queryAll('.comment-list app-comment').length).toBe(3);
      expect(query('.laptop').classList.contains('item-header')).toBe(true);
    });

    it('should render poll results only for polls', () => {
      emitItem(makeItem());
      expect(query('.pollResults')).toBeNull();

      emitItem(makeItem({
        type: 'poll',
        poll: [{ content: 'Yes', points: 3 }, { content: 'No', points: 1 }] as any,
        poll_votes_count: 4,
      }));
      const options = queryAll('.pollContent');
      expect(options.length).toBe(2);
      expect(options[0].textContent).toContain('Yes');
      expect(options[0].querySelector('.pollBar').style.width).toBe('75%');
    });

    it('should call goBack when the back button is clicked', () => {
      emitItem(makeItem());
      query('.back-button').click();
      expect(location.back).toHaveBeenCalled();
    });
  });
});
