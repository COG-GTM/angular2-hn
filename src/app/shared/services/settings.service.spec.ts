import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it('uses defaults when nothing is stored', () => {
    const { settings } = TestBed.inject(SettingsService);
    expect(settings()).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
  });

  it('updates the settings signal and persists preferences', () => {
    const service = TestBed.inject(SettingsService);

    service.toggleSettings();
    service.toggleOpenLinksInNewTab();
    service.setTheme('night');
    service.setFont('20');
    service.setSpacing('4');

    expect(service.settings()).toEqual({
      showSettings: true,
      openLinkInNewTab: true,
      theme: 'night',
      titleFontSize: '20',
      listSpacing: '4',
    });
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
    expect(localStorage.getItem('listSpacing')).toBe('4');
  });
});
