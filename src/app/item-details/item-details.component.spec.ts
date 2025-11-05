import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';
import { Settings } from '../shared/models/settings';
import { of, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let hackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
  let settingsService: jasmine.SpyObj<SettingsService>;
  let location: jasmine.SpyObj<Location>;
  let activatedRoute: any;
  let paramsSubject: BehaviorSubject<any>;
  let mockSettings: Settings;

  beforeEach(async () => {
    mockSettings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };

    hackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    settingsService = jasmine.createSpyObj('SettingsService', []);
    settingsService.settings = mockSettings;
    location = jasmine.createSpyObj('Location', ['back']);

    paramsSubject = new BehaviorSubject({ id: '123' });
    activatedRoute = {
      params: paramsSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      declarations: [ ItemDetailsComponent ],
      providers: [
        { provide: HackerNewsAPIService, useValue: hackerNewsAPIService },
        { provide: SettingsService, useValue: settingsService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Location, useValue: location }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    spyOn(window, 'scrollTo');
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize settings from service', () => {
    expect(component.settings).toEqual(mockSettings);
  });

  it('should fetch item content on ngOnInit', () => {
    const mockItem = {
      id: 123,
      title: 'Test Item',
      url: 'http://example.com',
      comments: []
    } as Story;

    hackerNewsAPIService.fetchItemContent.and.returnValue(of(mockItem));

    fixture.detectChanges();

    expect(hackerNewsAPIService.fetchItemContent).toHaveBeenCalledWith(123);
    expect(component.item).toEqual(mockItem);
  });

  it('should handle different item IDs from route params', () => {
    const mockItem: Story = { id: 456, title: 'Test' } as Story;
    hackerNewsAPIService.fetchItemContent.and.returnValue(of(mockItem));

    paramsSubject.next({ id: '456' });
    fixture.detectChanges();

    expect(hackerNewsAPIService.fetchItemContent).toHaveBeenCalledWith(456);
  });

  it('should set errorMessage on fetch error', () => {
    hackerNewsAPIService.fetchItemContent.and.returnValue(throwError('Network error'));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('should scroll to top on ngOnInit', () => {
    const mockItem: Story = { id: 123 } as Story;
    hackerNewsAPIService.fetchItemContent.and.returnValue(of(mockItem));

    fixture.detectChanges();

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should call location.back when goBack is called', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });

  it('should return true for hasUrl when url starts with http', () => {
    component.item = { url: 'http://example.com' } as Story;
    expect(component.hasUrl).toBe(true);
  });

  it('should return true for hasUrl when url starts with https', () => {
    component.item = { url: 'https://example.com' } as Story;
    expect(component.hasUrl).toBe(true);
  });

  it('should return false for hasUrl when url does not start with http', () => {
    component.item = { url: 'item?id=123' } as Story;
    expect(component.hasUrl).toBe(false);
  });
});
