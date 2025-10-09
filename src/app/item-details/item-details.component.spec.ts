import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemDetailsComponent } from './item-details.component';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { of, throwError } from 'rxjs';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let hackerNewsServiceSpy: jasmine.SpyObj<HackerNewsAPIService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let activatedRouteSpy: any;

  beforeEach(async () => {
    const hnSpy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    const locSpy = jasmine.createSpyObj('Location', ['back']);
    const settingsSpy = jasmine.createSpyObj('SettingsService', []);
    settingsSpy.settings = { openLinkInNewTab: false };
    activatedRouteSpy = {
      params: of({ id: '123' })
    };

    await TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: hnSpy },
        { provide: Location, useValue: locSpy },
        { provide: SettingsService, useValue: settingsSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    hackerNewsServiceSpy = TestBed.inject(HackerNewsAPIService) as jasmine.SpyObj<HackerNewsAPIService>;
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    settingsServiceSpy = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch item content on init', () => {
    const mockItem = { id: 123, title: 'Test Item', comments: [] };
    hackerNewsServiceSpy.fetchItemContent.and.returnValue(of(mockItem as any));

    fixture.detectChanges();

    expect(hackerNewsServiceSpy.fetchItemContent).toHaveBeenCalledWith(123);
    expect(component.item).toEqual(mockItem as any);
  });

  it('should handle errors when fetching item', () => {
    hackerNewsServiceSpy.fetchItemContent.and.returnValue(throwError(() => new Error('API Error')));

    fixture.detectChanges();

    expect(component.errorMessage).toBeTruthy();
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should determine if item has URL', () => {
    component.item = { url: 'https://example.com' } as any;
    expect(component.hasUrl).toBeTruthy();

    component.item = { url: '' } as any;
    expect(component.hasUrl).toBeFalsy();
  });
});
