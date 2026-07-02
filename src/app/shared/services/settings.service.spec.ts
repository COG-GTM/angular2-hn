import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('toggles the settings panel', () => {
    const initial = service.settings.showSettings;
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(!initial);
  });

  it('toggles open links in new tab and persists it', () => {
    const initial = service.settings.openLinkInNewTab;
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(!initial);
    expect(localStorage.getItem('openLinkInNewTab')).toBe(JSON.stringify(!initial));
  });

  it('sets and persists the theme', () => {
    service.setTheme('night');
    expect(service.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });
});
