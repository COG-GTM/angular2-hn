import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('provides defaults when localStorage is empty', () => {
    const service = new SettingsService();
    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
  });

  it('reads persisted values from localStorage', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('titleFontSize', '22');
    localStorage.setItem('listSpacing', '5');
    const service = new SettingsService();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.theme).toBe('amoledblack');
    expect(service.settings.titleFontSize).toBe('22');
    expect(service.settings.listSpacing).toBe('5');
  });

  it('toggleSettings flips showSettings', () => {
    const service = new SettingsService();
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('toggleOpenLinksInNewTab persists to localStorage', () => {
    const service = new SettingsService();
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('setTheme / setFont / setSpacing persist to localStorage', () => {
    const service = new SettingsService();
    service.setTheme('night');
    service.setFont('20');
    service.setSpacing('8');
    expect(service.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
    expect(service.settings.titleFontSize).toBe('20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
    expect(service.settings.listSpacing).toBe('8');
    expect(localStorage.getItem('listSpacing')).toBe('8');
  });

  it('respects a saved theme over the system preference', () => {
    localStorage.setItem('theme', 'night');
    const service = new SettingsService();
    expect(service.settings.theme).toBe('night');
  });
});
