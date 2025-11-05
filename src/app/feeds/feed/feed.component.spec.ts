import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';
import { of, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let hackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
  let activatedRoute: any;
  let dataSubject: BehaviorSubject<any>;
  let paramsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    hackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);

    dataSubject = new BehaviorSubject({ feedType: 'news' });
    paramsSubject = new BehaviorSubject({ page: '1' });

    activatedRoute = {
      data: dataSubject.asObservable(),
      params: paramsSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      declarations: [ FeedComponent ],
      providers: [
        { provide: HackerNewsAPIService, useValue: hackerNewsAPIService },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    spyOn(window, 'scrollTo');
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch feed on ngOnInit', () => {
    const mockStories: Story[] = [
      { id: 1, title: 'Test Story 1', url: 'http://test1.com' } as Story,
      { id: 2, title: 'Test Story 2', url: 'http://test2.com' } as Story
    ];

    hackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

    fixture.detectChanges();

    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(1);
    expect(hackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(component.items).toEqual(mockStories);
  });

  it('should handle different page numbers', () => {
    const mockStories: Story[] = [{ id: 1, title: 'Test', url: 'http://test.com' } as Story];
    hackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

    paramsSubject.next({ page: '3' });
    fixture.detectChanges();

    expect(component.pageNum).toBe(3);
    expect(hackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 3);
  });

  it('should default to page 1 if no page param', () => {
    const mockStories: Story[] = [];
    hackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

    paramsSubject.next({});
    fixture.detectChanges();

    expect(component.pageNum).toBe(1);
  });

  it('should set errorMessage on fetch error', () => {
    hackerNewsAPIService.fetchFeed.and.returnValue(throwError('Network error'));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load news stories.');
  });

  it('should calculate listStart correctly', () => {
    const mockStories: Story[] = [];
    hackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

    paramsSubject.next({ page: '2' });
    fixture.detectChanges();

    expect(component.listStart).toBe(31);
  });

  it('should scroll to top after loading', () => {
    const mockStories: Story[] = [];
    hackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

    fixture.detectChanges();

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should handle different feed types', () => {
    const mockStories: Story[] = [];
    hackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

    dataSubject.next({ feedType: 'newest' });
    paramsSubject.next({ page: '1' });
    fixture.detectChanges();

    expect(component.feedType).toBe('newest');
    expect(hackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('newest', 1);
  });
});
