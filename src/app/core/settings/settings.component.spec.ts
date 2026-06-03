import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settingsServiceSpy = jasmine.createSpyObj('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing',
    ]);
    (settingsServiceSpy as any).settings = {
      showSettings: true,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    };

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settingsServiceSpy.settings);
  });

  it('closes the settings panel', () => {
    component.closeSettings();
    expect(settingsServiceSpy.toggleSettings).toHaveBeenCalled();
  });

  it('toggles open-links-in-new-tab', () => {
    component.toggleOpenLinksInNewTab();
    expect(settingsServiceSpy.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('selects a theme', () => {
    component.selectTheme('night');
    expect(settingsServiceSpy.setTheme).toHaveBeenCalledWith('night');
  });

  it('changes the title font', () => {
    component.changeTitleFont('20');
    expect(settingsServiceSpy.setFont).toHaveBeenCalledWith('20');
  });

  it('changes the list spacing', () => {
    component.changeSpacing('5');
    expect(settingsServiceSpy.setSpacing).toHaveBeenCalledWith('5');
  });
});
