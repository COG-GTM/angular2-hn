import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SettingsServiceStub } from '../testing/settings-service.stub';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let params$: BehaviorSubject<any>;
  let settingsService: SettingsServiceStub;

  const story = {
    id: 7,
    title: 'A story',
    points: 10,
    user: 'pg',
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com/a',
    domain: 'example.com',
    content: '<p>body</p>',
    comments_count: 1,
    comments: [
      { id: 8, level: 0, user: 'bob', time: 0, time_ago: 'now', content: 'hi', deleted: false, comments: [] },
    ],
  } as any as Story;

  beforeEach(async(() => {
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    location = jasmine.createSpyObj('Location', ['back']);
    params$ = new BehaviorSubject({ id: '7' });
    settingsService = new SettingsServiceStub();
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemDetailsComponent, CommentComponent, LoaderComponent, ErrorMessageComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: settingsService },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: params$ } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  it('loads the item from the route id', () => {
    api.fetchItemContent.and.returnValue(of({ ...story }));
    fixture.detectChanges();

    expect(api.fetchItemContent).toHaveBeenCalledWith(7);
    expect(component.item.id).toBe(7);
    expect(component.hasUrl).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(el.querySelector('.domain').textContent).toContain('example.com');
    expect(el.querySelectorAll('app-comment').length).toBe(1);
    expect(el.textContent).toContain('1 comment');
  });

  it('honors the open-in-new-tab setting', () => {
    settingsService.settings.openLinkInNewTab = true;
    api.fetchItemContent.and.returnValue(of({ ...story }));
    fixture.detectChanges();

    const link = el.querySelector('.laptop a.title') as HTMLAnchorElement;
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('links internally when the item has no external url', () => {
    api.fetchItemContent.and.returnValue(of({ ...story, url: 'item?id=7' }));
    fixture.detectChanges();

    expect(component.hasUrl).toBe(false);
    const link = el.querySelector('.laptop a.title') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/item/7');
  });

  it('renders poll results', () => {
    api.fetchItemContent.and.returnValue(
      of({
        ...story,
        type: 'poll',
        poll: [{ points: 3, content: 'A' }, { points: 1, content: 'B' }],
        poll_votes_count: 4,
      })
    );
    fixture.detectChanges();

    const bars = el.querySelectorAll('.pollBar') as NodeListOf<HTMLElement>;
    expect(bars.length).toBe(2);
    expect(bars[0].style.width).toBe('75%');
  });

  it('hides points for jobs', () => {
    api.fetchItemContent.and.returnValue(of({ ...story, type: 'job' }));
    fixture.detectChanges();
    expect(el.textContent).not.toContain('points by');
  });

  it('shows an error when loading fails', () => {
    api.fetchItemContent.and.returnValue(throwError(new Error('x')));
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load item comments.');
    expect(el.querySelector('app-error-message')).not.toBeNull();
    expect(el.querySelector('app-loader')).toBeNull();
  });

  it('shows the loader while waiting', () => {
    api.fetchItemContent.and.returnValue(NEVER);
    fixture.detectChanges();
    expect(el.querySelector('app-loader')).not.toBeNull();
  });

  it('navigates back', () => {
    api.fetchItemContent.and.returnValue(of({ ...story }));
    fixture.detectChanges();
    (el.querySelector('.back-button') as HTMLElement).click();
    expect(location.back).toHaveBeenCalled();
  });
});
