import { ActivatedRoute, Data, Params } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { FeedComponent } from './feed.component';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let routeData: Subject<Data>;
  let routeParams: Subject<Params>;
  let scrollTo: jasmine.Spy;

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    routeData = new Subject<Data>();
    routeParams = new Subject<Params>();
    component = new FeedComponent(api, { data: routeData, params: routeParams } as unknown as ActivatedRoute);
    scrollTo = spyOn(window, 'scrollTo');
  });

  it('loads the route feed on the first page when no page parameter is given', () => {
    const stories = [new Story()];
    api.fetchFeed.and.returnValue(of(stories));

    component.ngOnInit();
    expect(api.fetchFeed).not.toHaveBeenCalled();
    routeData.next({ feedType: 'news' });
    routeParams.next({});

    expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(1);
    expect(component.items).toBe(stories);
    expect(component.listStart).toBe(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('reloads when route parameters change and numbers each page correctly', () => {
    api.fetchFeed.and.returnValue(of([new Story()]));
    component.ngOnInit();
    routeData.next({ feedType: 'jobs' });
    routeParams.next({ page: '2' });

    expect(api.fetchFeed).toHaveBeenCalledWith('jobs', 2);
    expect(component.listStart).toBe(31);

    routeData.next({ feedType: 'ask' });
    routeParams.next({ page: '3' });

    expect(api.fetchFeed).toHaveBeenCalledWith('ask', 3);
    expect(api.fetchFeed).toHaveBeenCalledTimes(2);
    expect(component.pageNum).toBe(3);
    expect(component.listStart).toBe(61);
    expect(scrollTo).toHaveBeenCalledTimes(2);
  });

  it('sets the list start and scrolls only after the feed completes', () => {
    const response = new Subject<Story[]>();
    const stories = [new Story()];
    api.fetchFeed.and.returnValue(response);
    component.ngOnInit();
    routeData.next({ feedType: 'show' });
    routeParams.next({ page: '2' });

    expect(component.items).toBeUndefined();
    expect(component.listStart).toBeUndefined();
    expect(scrollTo).not.toHaveBeenCalled();

    response.next(stories);
    expect(component.items).toBe(stories);
    expect(component.listStart).toBeUndefined();

    response.complete();
    expect(component.listStart).toBe(31);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows a feed-specific message when loading fails', () => {
    api.fetchFeed.and.returnValue(throwError(new Error('network unavailable')));
    component.ngOnInit();
    routeData.next({ feedType: 'ask' });
    routeParams.next({});

    expect(component.errorMessage).toBe('Could not load ask stories.');
    expect(component.items).toBeUndefined();
    expect(component.listStart).toBeUndefined();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
