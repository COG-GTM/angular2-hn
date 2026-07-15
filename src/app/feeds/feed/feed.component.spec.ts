import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { ItemComponent } from '../item/item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { feedNews1, feedNews2, feedJobs1 } from '../../../testing/fixtures';

function configure(
  apiMock: Partial<HackerNewsAPIService>,
  routeData: any,
  params: any
) {
  return TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    declarations: [
      FeedComponent,
      ItemComponent,
      CommentPipe,
      LoaderComponent,
      ErrorMessageComponent,
    ],
    providers: [
      { provide: HackerNewsAPIService, useValue: apiMock },
      {
        provide: ActivatedRoute,
        useValue: { data: of(routeData), params: of(params) },
      },
    ],
  }).compileComponents();
}

describe('FeedComponent', () => {
  afterEach(() => localStorage.clear());

  it('renders an ordered list starting at 1 on page 1 with a "More" link', async () => {
    await configure(
      { fetchFeed: () => of(feedNews1 as any) },
      { feedType: 'news' },
      { page: '1' }
    );
    const fixture: ComponentFixture<FeedComponent> = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const ol = el.querySelector('ol')!;
    expect(ol.getAttribute('start')).toBe('1');
    expect(el.querySelectorAll('li.post').length).toBe(30);
    expect(el.querySelector('.more')).toBeTruthy();
    expect(el.querySelector('.prev')).toBeFalsy();
  });

  it('shows "Prev" and hides "More" on page 2 with fewer than 30 items', async () => {
    await configure(
      { fetchFeed: () => of(feedNews2 as any) },
      { feedType: 'news' },
      { page: '2' }
    );
    const fixture: ComponentFixture<FeedComponent> = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('ol')!.getAttribute('start')).toBe('31');
    expect(el.querySelector('.prev')).toBeTruthy();
    expect(el.querySelector('.more')).toBeFalsy();
  });

  it('renders the jobs header for the jobs feed', async () => {
    await configure(
      { fetchFeed: () => of(feedJobs1 as any) },
      { feedType: 'jobs' },
      { page: '1' }
    );
    const fixture: ComponentFixture<FeedComponent> = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.job-header')).toBeTruthy();
    expect(el.textContent).toContain('These are jobs at startups');
  });

  it('renders an error message when the feed fails to load', async () => {
    await configure(
      { fetchFeed: () => throwError('boom') },
      { feedType: 'news' },
      { page: '1' }
    );
    const fixture: ComponentFixture<FeedComponent> = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Could not load news stories.');
  });
});
