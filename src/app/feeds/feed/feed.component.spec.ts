import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { ItemComponent } from '../item/item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsServiceStub } from '../../testing/settings-service.stub';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let data$: BehaviorSubject<any>;
  let params$: BehaviorSubject<any>;

  function makeStories(count: number): Story[] {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Story ${i + 1}`,
      url: 'https://example.com',
      type: 'story',
      user: 'u',
      points: 1,
      comments_count: 0,
      time_ago: 'now',
    })) as any as Story[];
  }

  beforeEach(async(() => {
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
    data$ = new BehaviorSubject({ feedType: 'news' });
    params$ = new BehaviorSubject({ page: '2' });
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent, LoaderComponent, ErrorMessageComponent, ItemComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useClass: SettingsServiceStub },
        { provide: ActivatedRoute, useValue: { data: data$, params: params$ } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('loads the feed for the route type and page', () => {
    api.fetchFeed.and.returnValue(of(makeStories(30)));
    fixture.detectChanges();

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(component.items.length).toBe(30);
    expect(component.listStart).toBe(31);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(fixture.nativeElement.querySelectorAll('li.post').length).toBe(30);
    expect(fixture.nativeElement.querySelector('a.prev')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a.more')).not.toBeNull();
  });

  it('defaults to page 1 and hides prev/more on a short first page', () => {
    params$.next({});
    api.fetchFeed.and.returnValue(of(makeStories(5)));
    fixture.detectChanges();

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(component.pageNum).toBe(1);
    expect(component.listStart).toBe(1);
    expect(fixture.nativeElement.querySelector('a.prev')).toBeNull();
    expect(fixture.nativeElement.querySelector('a.more')).toBeNull();
  });

  it('shows the loader before data arrives', () => {
    api.fetchFeed.and.returnValue(NEVER);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-loader')).not.toBeNull();
  });

  it('shows an error message when the fetch fails', () => {
    api.fetchFeed.and.returnValue(throwError(new Error('boom')));
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load news stories.');
    expect(fixture.nativeElement.querySelector('app-error-message').textContent).toContain('Could not load news stories.');
  });

  it('shows the jobs header for the jobs feed', () => {
    data$.next({ feedType: 'jobs' });
    api.fetchFeed.and.returnValue(of(makeStories(3).map(s => ({ ...s, type: 'job' })) as any));
    fixture.detectChanges();

    expect(api.fetchFeed).toHaveBeenCalledWith('jobs', 2);
    expect(fixture.nativeElement.querySelector('.job-header')).not.toBeNull();
  });

  it('refetches when the page param changes', () => {
    api.fetchFeed.and.returnValue(of(makeStories(30)));
    fixture.detectChanges();
    params$.next({ page: '3' });
    fixture.detectChanges();

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 3);
    expect(component.listStart).toBe(61);
  });
});
