import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let apiService: { fetchItemContent: jasmine.Spy };
  let location: Location;

  beforeEach(() => {
    apiService = { fetchItemContent: jasmine.createSpy('fetchItemContent') };
    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent],
      imports: [RouterTestingModule, PipesModule],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        {
          provide: SettingsService,
          useValue: {
            settings: {
              showSettings: false,
              openLinkInNewTab: false,
              theme: 'default',
              titleFontSize: '16',
              listSpacing: '0'
            },
            toggleSettings: jasmine.createSpy('toggleSettings')
          }
        },
        { provide: ActivatedRoute, useValue: { params: of({ id: '5' }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    spyOn(window, 'scrollTo');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch the item content on init', () => {
    const story = { id: 5, title: 'story', url: 'https://x' };
    apiService.fetchItemContent.and.returnValue(of(story));
    fixture.detectChanges();
    expect(apiService.fetchItemContent).toHaveBeenCalledWith(5);
    expect(component.item).toEqual(story as Story);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should set errorMessage when fetching the item fails', () => {
    apiService.fetchItemContent.and.returnValue(throwError('boom'));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('should call Location.back on goBack', () => {
    const backSpy = spyOn(location, 'back');
    apiService.fetchItemContent.and.returnValue(of({ id: 5, url: 'https://x' }));
    fixture.detectChanges();
    component.goBack();
    expect(backSpy).toHaveBeenCalled();
  });

  it('should report hasUrl based on the item url', () => {
    apiService.fetchItemContent.and.returnValue(of({ id: 5, url: 'https://x' }));
    fixture.detectChanges();
    expect(component.hasUrl).toBe(true);
    component.item = { id: 5, url: 'item?id=5' } as Story;
    expect(component.hasUrl).toBe(false);
  });
});
