import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('HeaderComponent', () => {
  let settingsService: jasmine.SpyObj<SettingsService>;
  let originalScrollTo: any;

  beforeEach(() => {
    originalScrollTo = (window as any).scrollTo;
    settingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings']);
    settingsService.settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };
    (window as any).scrollTo = jasmine.createSpy('scrollTo');
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        {provide: SettingsService, useValue: settingsService}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  afterEach(() => {
    (window as any).scrollTo = originalScrollTo;
  });

  it('delegates toggling settings', () => {
    const component = new HeaderComponent(settingsService);

    component.toggleSettings();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('scrolls to the top', () => {
    const component = new HeaderComponent(settingsService);

    component.scrollTop();

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
