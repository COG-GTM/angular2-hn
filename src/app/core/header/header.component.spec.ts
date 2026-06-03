import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['toggleSettings']);
    (settingsServiceSpy as any).settings = { showSettings: false, theme: 'default' };

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settingsServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component and reads settings from the service', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settingsServiceSpy.settings);
  });

  it('delegates toggleSettings to the settings service', () => {
    component.toggleSettings();
    expect(settingsServiceSpy.toggleSettings).toHaveBeenCalled();
  });

  it('scrolls to the top of the page', () => {
    const scrollSpy = spyOn(window, 'scrollTo');
    component.scrollTop();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });
});
