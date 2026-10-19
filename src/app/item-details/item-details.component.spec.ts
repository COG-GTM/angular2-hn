import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER, Observable, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';
import { Comment } from '../shared/models/comment';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let settings: Settings;

  function story(overrides: Partial<Story> = {}): Story {
    return {
      id: 42,
      title: 'An interesting article',
      points: 120,
      user: 'pg',
      time_ago: '5 hours ago',
      type: 'story',
      url: 'https://example.com/article',
      domain: 'example.com',
      comments_count: 2,
      comments: [{ id: 1, user: 'dang' } as Comment, { id: 2, user: 'tptacek' } as Comment],
      ...overrides,
    } as Story;
  }

  function render(response: Observable<Story>) {
    api.fetchItemContent.and.returnValue(response);
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(async(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemDetailsComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: { settings } },
        { provide: ActivatedRoute, useValue: { params: of({ id: '42' }) } },
        { provide: Location, useValue: location },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  it('should create and fetch the item by numeric id from the route', () => {
    render(of(story()));

    expect(component).toBeTruthy();
    expect(api.fetchItemContent).toHaveBeenCalledWith(42);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should render the item header', () => {
    render(of(story()));

    const laptop = element.querySelector('.laptop');
    const title: HTMLAnchorElement = laptop.querySelector('a.title');
    expect(title.textContent.trim()).toBe('An interesting article');
    expect(title.getAttribute('href')).toBe('https://example.com/article');
    expect(laptop.querySelector('.domain').textContent).toBe('(example.com)');
    expect(laptop.querySelector('.subtext').textContent).toContain('120 points by');
    expect(laptop.querySelector('a[href="/user/pg"]').textContent).toBe('pg');
    expect(laptop.textContent).toContain('2 comments');
  });

  it('should render one app-comment per top-level comment', () => {
    render(of(story()));

    expect(element.querySelectorAll('.comment-list app-comment').length).toBe(2);
  });

  it('should render the item text content', () => {
    render(of(story({ url: 'item?id=42', content: '<p>Ask HN body</p>' } as any)));

    expect(component.hasUrl).toBe(false);
    expect(element.querySelector('.subject').innerHTML).toContain('Ask HN body');
    expect(element.querySelector('.laptop a.title').getAttribute('href')).toBe('/item/42');
  });

  it('should render poll results with proportional bars', () => {
    render(
      of(
        story({
          type: 'poll',
          poll: [{ content: 'Yes', points: 30 }, { content: 'No', points: 10 }],
          poll_votes_count: 40,
        })
      )
    );

    const options = element.querySelectorAll<HTMLElement>('.pollContent');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Yes');
    expect(options[0].querySelector('.subtext').textContent).toBe('30 points');
    expect(options[0].querySelector<HTMLElement>('.pollBar').style.width).toBe('75%');
    expect(options[1].querySelector<HTMLElement>('.pollBar').style.width).toBe('25%');
  });

  it('should open external links in a new tab when the setting is enabled', () => {
    settings.openLinkInNewTab = true;
    render(of(story()));

    expect(element.querySelector('.laptop a.title').getAttribute('target')).toBe('_blank');
  });

  it('should show the loader while the item is loading', () => {
    render(NEVER);

    expect(element.querySelector('app-loader')).not.toBeNull();
    expect(element.querySelector('.item')).toBeNull();
  });

  it('should show an error message when the item fails to load', () => {
    render(throwError(new Error('offline')));

    expect(component.errorMessage).toBe('Could not load item comments.');
    expect(element.querySelector('app-error-message')).not.toBeNull();
  });

  it('should navigate back when the back button is clicked', () => {
    render(of(story()));

    element.querySelector<HTMLElement>('.back-button').click();

    expect(location.back).toHaveBeenCalled();
  });
});
