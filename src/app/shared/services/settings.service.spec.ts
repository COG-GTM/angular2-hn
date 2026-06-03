import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('falls back to defaults when localStorage is empty', () => {
    const service = new SettingsService();
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
    expect(service.settings.showSettings).toBe(false);
  });

  it('hydrates settings from localStorage when values are present', () => {
    localStorage.setItem('openLinkInNewTab', JSON.stringify(true));
    localStorage.setItem('titleFontSize', '22');
    localStorage.setItem('listSpacing', '8');
    localStorage.setItem('theme', 'night');

    const service = new SettingsService();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.titleFontSize).toBe('22');
    expect(service.settings.listSpacing).toBe('8');
    expect(service.settings.theme).toBe('night');
  });

  it('toggles the settings panel visibility', () => {
    const service = new SettingsService();
    expect(service.settings.showSettings).toBe(false);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('toggles open-links-in-new-tab and persists it', () => {
    const service = new SettingsService();
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(JSON.parse(localStorage.getItem('openLinkInNewTab') || 'false')).toBe(true);
  });

  it('sets the theme and persists it', () => {
    const service = new SettingsService();
    service.setTheme('amoledblack');
    expect(service.settings.theme).toBe('amoledblack');
    expect(localStorage.getItem('theme')).toBe('amoledblack');
  });

  it('sets the title font size and persists it', () => {
    const service = new SettingsService();
    service.setFont('30');
    expect(service.settings.titleFontSize).toBe('30');
    expect(localStorage.getItem('titleFontSize')).toBe('30');
  });

  it('sets the list spacing and persists it', () => {
    const service = new SettingsService();
    service.setSpacing('12');
    expect(service.settings.listSpacing).toBe('12');
    expect(localStorage.getItem('listSpacing')).toBe('12');
  });

  it('maps a dark system color scheme change to the night theme', () => {
    const service = new SettingsService();
    service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('night');
  });

  it('maps a light system color scheme change to the default theme', () => {
    const service = new SettingsService();
    service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('default');
  });

  it('removes the media listener on destroy without throwing', () => {
    const service = new SettingsService();
    expect(() => service.ngOnDestroy()).not.toThrow();
  });
});
