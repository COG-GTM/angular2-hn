import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { Story } from '../../shared/models/story';

function buildStories(count: number): Story[] {
  return Array.from({ length: count }, (_, i) => {
    const story = new Story();
    story.id = i + 1;
    story.title = 'Story ' + (i + 1);
    story.url = 'https://example.com/' + (i + 1);
    story.type = 'story';
    story.comments_count = 0;
    return story;
  });
}

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let apiSpy: jasmine.SpyObj<HackerNewsAPIService>;
  let dataSubject: Subject<any>;
  let paramsSubject: Subject<any>;

  function configure() {
    TestBed.configureTestingModule({
      declarations: [FeedComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiSpy },
        {
          provide: ActivatedRoute,
          useValue: { data: dataSubject.asObservable(), params: paramsSubject.asObservable() },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
    dataSubject = new Subject<any>();
    paramsSubject = new Subject<any>();
  });

  it('loads the feed and computes the list start for a given page', () => {
    apiSpy.fetchFeed.and.returnValue(of(buildStories(30)));
    configure();
    const scrollSpy = spyOn(window, 'scrollTo');

    fixture.detectChanges();
    dataSubject.next({ feedType: 'news' });
    paramsSubject.next({ page: '2' });

    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(2);
    expect(apiSpy.fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(component.items.length).toBe(30);
    expect(component.listStart).toBe(31);
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('defaults to page 1 when no page param is present', () => {
    apiSpy.fetchFeed.and.returnValue(of(buildStories(5)));
    configure();
    spyOn(window, 'scrollTo');

    fixture.detectChanges();
    dataSubject.next({ feedType: 'show' });
    paramsSubject.next({});

    expect(component.pageNum).toBe(1);
    expect(component.listStart).toBe(1);
  });

  it('sets an error message when the feed fails to load', () => {
    apiSpy.fetchFeed.and.returnValue(throwError('boom'));
    configure();

    fixture.detectChanges();
    dataSubject.next({ feedType: 'ask' });
    paramsSubject.next({ page: '1' });

    expect(component.errorMessage).toBe('Could not load ask stories.');
  });
});
