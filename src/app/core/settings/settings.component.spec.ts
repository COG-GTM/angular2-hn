import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsService: any;

  beforeEach(() => {
    settingsService = {
      settings: {
        showSettings: true,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      },
      toggleSettings: jasmine.createSpy('toggleSettings'),
      toggleOpenLinksInNewTab: jasmine.createSpy('toggleOpenLinksInNewTab'),
      setTheme: jasmine.createSpy('setTheme'),
      setFont: jasmine.createSpy('setFont'),
      setSpacing: jasmine.createSpy('setSpacing')
    };
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the settings from the service', () => {
    expect(component.settings).toEqual(settingsService.settings);
  });

  it('should delegate closeSettings to toggleSettings', () => {
    component.closeSettings();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('should delegate toggleOpenLinksInNewTab', () => {
    component.toggleOpenLinksInNewTab();
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('should delegate selectTheme with the theme', () => {
    component.selectTheme('night');
    expect(settingsService.setTheme).toHaveBeenCalledWith('night');
  });

  it('should delegate changeTitleFont with the value', () => {
    component.changeTitleFont('20');
    expect(settingsService.setFont).toHaveBeenCalledWith('20');
  });

  it('should delegate changeSpacing with the value', () => {
    component.changeSpacing('8');
    expect(settingsService.setSpacing).toHaveBeenCalledWith('8');
  });
});
