import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';

describe('FeedComponent', () => {
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let route: any;
  const story = {id: 1, title: 'Story'} as any;

  beforeEach(() => {
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
    route = {
      data: of({feedType: 'ask'}),
      params: of({page: '2'})
    };
    spyOn(window, 'scrollTo').and.stub();
    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        {provide: ActivatedRoute, useValue: route},
        {provide: HackerNewsAPIService, useValue: api}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('loads a feed and calculates its list start', () => {
    api.fetchFeed.and.returnValue(of([story]));
    const component = TestBed.createComponent(FeedComponent).componentInstance;

    component.ngOnInit();

    expect(component.feedType).toBe('ask');
    expect(component.pageNum).toBe(2);
    expect(api.fetchFeed).toHaveBeenCalledWith('ask', 2);
    expect(component.items).toEqual([story]);
    expect(component.listStart).toBe(31);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('defaults to the first page', () => {
    route.params = of({});
    api.fetchFeed.and.returnValue(of([story]));
    const component = TestBed.createComponent(FeedComponent).componentInstance;

    component.ngOnInit();

    expect(component.pageNum).toBe(1);
    expect(component.listStart).toBe(1);
  });

  it('sets an error message when the feed fails', () => {
    api.fetchFeed.and.returnValue(throwError('x'));
    const component = TestBed.createComponent(FeedComponent).componentInstance;

    component.ngOnInit();

    expect(component.errorMessage).toBe('Could not load ask stories.');
  });
});
