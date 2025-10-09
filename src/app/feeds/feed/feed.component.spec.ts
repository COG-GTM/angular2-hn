import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
    
    mockActivatedRoute = {
      data: of({ feedType: 'news' }),
      params: of({ page: '1' })
    };

    await TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with feedType from route data', () => {
    mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    expect(component.feedType).toBe('news');
  });

  it('should fetch feed on init', () => {
    const mockStories: Story[] = [
      { id: 1, title: 'Test Story', points: 100, user: 'testuser', time_ago: '1 hour ago', comments_count: 10 } as Story
    ];
    mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
    
    fixture.detectChanges();
    
    expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(component.items).toEqual(mockStories);
  });

  it('should handle different page numbers from route params', () => {
    mockActivatedRoute.params = of({ page: '3' });
    mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 3);
  });

  it('should set error message on fetch failure', () => {
    mockHackerNewsAPIService.fetchFeed.and.returnValue(throwError(() => new Error('Network error')));
    
    fixture.detectChanges();
    
    expect(component.errorMessage).toBe('Could not load news stories.');
  });

  it('should calculate listStart correctly', () => {
    mockActivatedRoute.params = of({ page: '2' });
    mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    expect(component.listStart).toBe(31);
  });

  it('should default to page 1 when no page param provided', () => {
    mockActivatedRoute.params = of({});
    mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    expect(component.pageNum).toBe(1);
  });
});
