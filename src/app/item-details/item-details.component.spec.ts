import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';

function makeStory(partial: Partial<Story>): Story {
  const story = new Story();
  Object.assign(story, {
    id: 1,
    title: 'Detail story',
    url: 'https://example.com',
    user: 'pg',
    points: 10,
    time_ago: '1 hour ago',
    type: 'story',
    comments_count: 0,
    comments: [],
  });
  Object.assign(story, partial);
  return story;
}

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let apiSpy: jasmine.SpyObj<HackerNewsAPIService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let paramsSubject: Subject<any>;

  function configure() {
    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent, CommentComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiSpy },
        { provide: Location, useValue: locationSpy },
        {
          provide: SettingsService,
          useValue: { settings: { openLinkInNewTab: false, theme: 'default' } },
        },
        { provide: ActivatedRoute, useValue: { params: paramsSubject.asObservable() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    locationSpy = jasmine.createSpyObj('Location', ['back']);
    paramsSubject = new Subject<any>();
  });

  it('loads the item content and scrolls to top', () => {
    apiSpy.fetchItemContent.and.returnValue(of(makeStory({ id: 42, title: 'Loaded' })));
    configure();
    const scrollSpy = spyOn(window, 'scrollTo');

    fixture.detectChanges();
    paramsSubject.next({ id: '42' });

    expect(apiSpy.fetchItemContent).toHaveBeenCalledWith(42);
    expect(component.item.title).toBe('Loaded');
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('sets an error message when loading fails', () => {
    apiSpy.fetchItemContent.and.returnValue(throwError('boom'));
    configure();
    spyOn(window, 'scrollTo');

    fixture.detectChanges();
    paramsSubject.next({ id: '1' });

    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('hasUrl reflects whether the item links externally', () => {
    apiSpy.fetchItemContent.and.returnValue(of(makeStory({ url: 'https://x.com' })));
    configure();
    spyOn(window, 'scrollTo');

    fixture.detectChanges();
    paramsSubject.next({ id: '1' });
    expect(component.hasUrl).toBe(true);

    component.item.url = 'item?id=1';
    expect(component.hasUrl).toBe(false);
  });

  it('navigates back via the Location service', () => {
    apiSpy.fetchItemContent.and.returnValue(of(makeStory({})));
    configure();
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});
