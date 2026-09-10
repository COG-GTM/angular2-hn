import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';

describe('ItemDetailsComponent', () => {
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let settingsService: any;
  const settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0'
  };

  beforeEach(() => {
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    location = jasmine.createSpyObj('Location', ['back']);
    settingsService = {settings};
    spyOn(window, 'scrollTo').and.stub();
    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent],
      providers: [
        {provide: ActivatedRoute, useValue: {params: of({id: '123'})}},
        {provide: HackerNewsAPIService, useValue: api},
        {provide: SettingsService, useValue: settingsService},
        {provide: Location, useValue: location}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('loads an item and scrolls to the top', () => {
    const item = {id: 123, url: 'https://x'} as any;
    api.fetchItemContent.and.returnValue(of(item));
    const component = TestBed.createComponent(ItemDetailsComponent).componentInstance;

    component.ngOnInit();

    expect(api.fetchItemContent).toHaveBeenCalledWith(123);
    expect(component.item).toBe(item);
    expect(component.settings).toBe(settings);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('sets an error message when loading comments fails', () => {
    api.fetchItemContent.and.returnValue(throwError('x'));
    const component = TestBed.createComponent(ItemDetailsComponent).componentInstance;

    component.ngOnInit();

    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('goes back in browser history', () => {
    const component = TestBed.createComponent(ItemDetailsComponent).componentInstance;

    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });

  it('detects external URLs', () => {
    const component = TestBed.createComponent(ItemDetailsComponent).componentInstance;

    component.item = {url: 'https://x'} as any;
    expect(component.hasUrl).toBe(true);
    component.item = {url: 'item?id=1'} as any;
    expect(component.hasUrl).toBe(false);
  });
});
