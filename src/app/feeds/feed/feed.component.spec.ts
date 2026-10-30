import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { FeedComponent } from './feed.component';

describe('FeedComponent', () => {
  const stories = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    title: `Story ${i + 1}`,
    url: `https://example.com/${i + 1}`,
    domain: 'example.com',
    type: 'story',
    points: i,
    user: 'pg',
    time_ago: '1 hour ago',
    comments_count: i,
  })) as unknown as Story[];

  const setup = (fetchFeed: HackerNewsAPIService['fetchFeed']) => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: ':feed/:page', component: FeedComponent, data: { feedType: 'news' } }]),
        { provide: HackerNewsAPIService, useValue: { fetchFeed: vi.fn(fetchFeed) } },
      ],
    });
    window.scrollTo = vi.fn();
    return RouterTestingHarness.create();
  };

  it('renders the stories for the requested page', async () => {
    const harness = await setup(() => of(stories));
    await harness.navigateByUrl('/news/2', FeedComponent);

    const api = TestBed.inject(HackerNewsAPIService);
    expect(api.fetchFeed).toHaveBeenCalledWith('news', 2);

    const el: HTMLElement = harness.routeNativeElement!;
    expect(el.querySelectorAll('li.post').length).toBe(30);
    expect(el.querySelector('ol')?.getAttribute('start')).toBe('31');
    expect(el.querySelector('.prev')?.getAttribute('href')).toBe('/news/1');
    expect(el.querySelector('.more')?.getAttribute('href')).toBe('/news/3');
  });

  it('shows an error message when the feed fails to load', async () => {
    const harness = await setup(() => throwError(() => new Error('offline')));
    await harness.navigateByUrl('/news/1', FeedComponent);

    expect(harness.routeNativeElement?.textContent).toContain('Could not load news stories.');
  });
});
