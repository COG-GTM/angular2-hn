import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let params: BehaviorSubject<any>;
  let settings: Settings;

  const story = (overrides: any = {}): Story =>
    ({
      id: 8863,
      title: 'My YC app: Dropbox',
      points: 104,
      user: 'dhouston',
      time_ago: '15 years ago',
      type: 'story',
      url: 'http://www.getdropbox.com/u/2/screencast.html',
      domain: 'getdropbox.com',
      content: '',
      comments_count: 3,
      comments: [
        {
          id: 1, level: 0, user: 'alice', time_ago: '1h', content: 'Top', deleted: false,
          comments: [{ id: 2, level: 1, user: 'bob', time_ago: '1h', content: 'Nested', deleted: false, comments: [] }],
        },
        { id: 3, level: 0, user: 'carol', time_ago: '1h', content: 'Second', deleted: false, comments: [] },
      ],
      ...overrides,
    } as Story);

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    params = new BehaviorSubject({ id: '8863' });
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedComponentsModule, PipesModule],
      declarations: [ItemDetailsComponent, CommentComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: { settings } },
        { provide: ActivatedRoute, useValue: { params } },
        { provide: Location, useValue: location },
      ],
    });

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  function el(): HTMLElement {
    return fixture.nativeElement;
  }

  it('shows the loader while the item is loading', () => {
    api.fetchItemContent.and.returnValue(new Subject<Story>());
    fixture.detectChanges();
    expect(el().querySelector('app-loader')).toBeTruthy();
    expect(el().querySelector('.item')).toBeNull();
  });

  it('loads the item using the numeric id route param and scrolls to top', () => {
    api.fetchItemContent.and.returnValue(of(story()));
    fixture.detectChanges();
    expect(api.fetchItemContent).toHaveBeenCalledWith(8863);
    expect(component.item.id).toBe(8863);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('reloads when the id param changes', () => {
    api.fetchItemContent.and.returnValue(of(story()));
    fixture.detectChanges();
    params.next({ id: '42' });
    expect(api.fetchItemContent).toHaveBeenCalledWith(42);
  });

  it('renders the title, domain and subtext', () => {
    api.fetchItemContent.and.returnValue(of(story()));
    fixture.detectChanges();

    const laptop = el().querySelector('.laptop');
    const title = laptop.querySelector('a.title');
    expect(title.textContent.trim()).toBe('My YC app: Dropbox');
    expect(title.getAttribute('href')).toBe('http://www.getdropbox.com/u/2/screencast.html');
    expect(laptop.querySelector('.domain').textContent).toBe('(getdropbox.com)');
    const subtext = laptop.querySelector('.subtext').textContent.replace(/\s+/g, ' ');
    expect(subtext).toContain('104 points by dhouston');
    expect(subtext).toContain('3 comments');
  });

  it('links self posts to the item route and renders their content', () => {
    api.fetchItemContent.and.returnValue(of(story({ url: 'item?id=8863', domain: null, content: '<b>Ask HN body</b>' })));
    fixture.detectChanges();
    expect(component.hasUrl).toBe(false);
    expect(el().querySelector('.laptop a.title').getAttribute('href')).toBe('/item/8863');
    expect(el().querySelector('.subject b').textContent).toBe('Ask HN body');
  });

  it('honours the open-in-new-tab setting', () => {
    settings.openLinkInNewTab = true;
    api.fetchItemContent.and.returnValue(of(story()));
    fixture.detectChanges();
    const title = el().querySelector('.laptop a.title');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('renders top-level and nested comments', () => {
    api.fetchItemContent.and.returnValue(of(story()));
    fixture.detectChanges();

    const topLevel = el().querySelectorAll('.comment-list > li');
    expect(topLevel.length).toBe(2);
    const comments = fixture.debugElement.queryAll(By.directive(CommentComponent));
    expect(comments.map(c => c.componentInstance.comment.user)).toEqual(['alice', 'bob', 'carol']);
    expect(el().textContent).toContain('Nested');
  });

  it('renders poll options with proportional bars', () => {
    api.fetchItemContent.and.returnValue(
      of(story({
        type: 'poll',
        poll: [{ points: 30, content: 'Yes' }, { points: 10, content: 'No' }],
        poll_votes_count: 40,
        comments: [],
      }))
    );
    fixture.detectChanges();

    const options = el().querySelectorAll('.pollContent');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Yes');
    expect(options[0].textContent).toContain('30 points');
    expect((options[0].querySelector('.pollBar') as HTMLElement).style.width).toBe('75%');
    expect((options[1].querySelector('.pollBar') as HTMLElement).style.width).toBe('25%');
  });

  it('goes back when the back button is clicked', () => {
    api.fetchItemContent.and.returnValue(of(story()));
    fixture.detectChanges();
    (el().querySelector('.back-button') as HTMLElement).click();
    expect(location.back).toHaveBeenCalled();
  });

  it('shows an error message when the item fails to load', () => {
    api.fetchItemContent.and.returnValue(throwError(new Error('offline')));
    fixture.detectChanges();
    expect(el().querySelector('app-loader')).toBeNull();
    expect(el().querySelector('app-error-message').textContent).toContain('Could not load item comments.');
  });
});
