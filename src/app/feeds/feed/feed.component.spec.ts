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
});
