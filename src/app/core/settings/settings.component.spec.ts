import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settingsService = jasmine.createSpyObj('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing'
    ]);
    settingsService.settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [
        {provide: SettingsService, useValue: settingsService}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('delegates settings actions', () => {
    const component = TestBed.createComponent(SettingsComponent).componentInstance;

    component.closeSettings();
    component.toggleOpenLinksInNewTab();
    component.selectTheme('night');
    component.changeTitleFont('18');
    component.changeSpacing('4');

    expect(settingsService.toggleSettings).toHaveBeenCalled();
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    expect(settingsService.setTheme).toHaveBeenCalledWith('night');
    expect(settingsService.setFont).toHaveBeenCalledWith('18');
    expect(settingsService.setSpacing).toHaveBeenCalledWith('4');
  });
});
