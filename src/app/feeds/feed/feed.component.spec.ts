import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, Subject } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let apiService: { fetchFeed: jasmine.Spy };
  let paramsSubject: Subject<any>;

  beforeEach(() => {
    apiService = { fetchFeed: jasmine.createSpy('fetchFeed') };
    paramsSubject = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ feedType: 'news' }),
            params: paramsSubject.asObservable()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    spyOn(window, 'scrollTo');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set feedType, pageNum, items and listStart on init', () => {
    apiService.fetchFeed.and.returnValue(of([{ id: 1 }, { id: 2 }]));
    fixture.detectChanges();
    paramsSubject.next({ page: '2' });
    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(2);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(component.items.length).toBe(2);
    expect(component.listStart).toBe(31);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should default pageNum to 1 when the param is missing', () => {
    apiService.fetchFeed.and.returnValue(of([]));
    fixture.detectChanges();
    paramsSubject.next({});
    expect(component.pageNum).toBe(1);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(component.listStart).toBe(1);
  });

  it('should set errorMessage when fetching the feed fails', () => {
    apiService.fetchFeed.and.returnValue(throwError('boom'));
    fixture.detectChanges();
    paramsSubject.next({ page: '2' });
    expect(component.errorMessage).toBe('Could not load news stories.');
    expect(component.items).toBeUndefined();
  });
});
