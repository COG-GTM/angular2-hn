import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { of, throwError } from 'rxjs';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let mockHNService: jasmine.SpyObj<HackerNewsAPIService>;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockHNService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    mockSettingsService = jasmine.createSpyObj('SettingsService', [], {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    });
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    mockActivatedRoute = {
      params: of({ id: '123' })
    };

    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHNService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: Location, useValue: mockLocation },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch item content on init', () => {
    const mockItem = {
      id: 123,
      title: 'Test Item',
      url: 'https://example.com',
      comments: []
    };
    mockHNService.fetchItemContent.and.returnValue(of(mockItem as any));
    
    component.ngOnInit();
    
    expect(mockHNService.fetchItemContent).toHaveBeenCalledWith(123);
  });

  it('should handle error when fetching item fails', () => {
    mockHNService.fetchItemContent.and.returnValue(throwError(() => new Error('API Error')));
    
    component.ngOnInit();
    
    expect(component.errorMessage).toBeTruthy();
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });
});
