import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { of, throwError } from 'rxjs';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let mockHNService: jasmine.SpyObj<HackerNewsAPIService>;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockHNService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
    mockSettingsService = jasmine.createSpyObj('SettingsService', [], {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    });

    mockActivatedRoute = {
      params: of({ feedType: 'news', page: '1' })
    };

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHNService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch feed data on init', () => {
    const mockStories = [
      { id: 1, title: 'Test Story 1', url: 'https://example.com/1' },
      { id: 2, title: 'Test Story 2', url: 'https://example.com/2' }
    ];
    mockHNService.fetchFeed.and.returnValue(of(mockStories as any));
    
    component.ngOnInit();
    
    expect(mockHNService.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('should handle error when fetching feed fails', () => {
    mockHNService.fetchFeed.and.returnValue(throwError(() => new Error('API Error')));
    
    component.ngOnInit();
    
    expect(component.errorMessage).toBeTruthy();
  });

  it('should subscribe to route data and set feedType', () => {
    mockActivatedRoute = {
      data: of({ feedType: 'newest' }),
      params: of({ page: '1' })
    };
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
    
    const newFixture = TestBed.createComponent(FeedComponent);
    const newComponent = newFixture.componentInstance;
    
    mockHNService.fetchFeed.and.returnValue(of([]));
    newComponent.ngOnInit();
    
    expect(newComponent.feedType).toBe('newest');
  });

  it('should default to page 1 when no page param is provided', () => {
    mockActivatedRoute = {
      data: of({ feedType: 'news' }),
      params: of({})
    };
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
    
    const newFixture = TestBed.createComponent(FeedComponent);
    const newComponent = newFixture.componentInstance;
    
    mockHNService.fetchFeed.and.returnValue(of([]));
    newComponent.ngOnInit();
    
    expect(newComponent.pageNum).toBe(1);
  });

  it('should calculate listStart correctly on successful fetch', (done) => {
    const mockStories = [{ id: 1, title: 'Test' }];
    mockHNService.fetchFeed.and.returnValue(of(mockStories as any));
    
    spyOn(window, 'scrollTo');
    
    component.ngOnInit();
    
    setTimeout(() => {
      expect(component.listStart).toBe(1);
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
      done();
    }, 100);
  });

  it('should calculate listStart correctly for page 2', () => {
    mockActivatedRoute = {
      data: of({ feedType: 'news' }),
      params: of({ page: '2' })
    };
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
    
    const newFixture = TestBed.createComponent(FeedComponent);
    const newComponent = newFixture.componentInstance;
    
    mockHNService.fetchFeed.and.returnValue(of([]));
    spyOn(window, 'scrollTo');
    
    newComponent.ngOnInit();
    
    setTimeout(() => {
      expect(newComponent.listStart).toBe(31);
    }, 100);
  });

  it('should handle empty feed results', () => {
    mockHNService.fetchFeed.and.returnValue(of([]));
    
    component.ngOnInit();
    
    expect(component.items).toEqual([]);
    expect(component.errorMessage).toBe('');
  });

  it('should set error message with feed type in error', () => {
    mockActivatedRoute = {
      data: of({ feedType: 'show' }),
      params: of({ page: '1' })
    };
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
    
    const newFixture = TestBed.createComponent(FeedComponent);
    const newComponent = newFixture.componentInstance;
    
    mockHNService.fetchFeed.and.returnValue(throwError(() => new Error('API Error')));
    
    newComponent.ngOnInit();
    
    expect(newComponent.errorMessage).toBe('Could not load show stories.');
  });
});
