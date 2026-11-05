import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('restores persisted settings', () => {
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('titleFontSize', '20');
    const service = TestBed.inject(SettingsService);
    expect(service.settings().theme).toBe('amoledblack');
    expect(service.settings().titleFontSize).toBe('20');
  });

  it('updates and persists settings', () => {
    const service = TestBed.inject(SettingsService);
    service.setTheme('night');
    service.setSpacing('8');
    service.toggleOpenLinksInNewTab();
    service.toggleSettings();
    expect(service.settings()).toEqual(
      jasmine.objectContaining({ theme: 'night', listSpacing: '8', openLinkInNewTab: true, showSettings: true })
    );
    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('listSpacing')).toBe('8');
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });
});
