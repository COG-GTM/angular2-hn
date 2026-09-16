import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let mediaQueryList: any;

  function buildService(): SettingsService {
    return new SettingsService();
  }

  beforeEach(() => {
    localStorage.clear();
    mediaQueryList = {
      media: '(prefers-color-scheme: dark)',
      matches: false,
      onchange: null,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent').and.returnValue(true)
    };
    spyOn(window, 'matchMedia').and.returnValue(mediaQueryList);
  });

  it('should use defaults when localStorage is empty', () => {
    const service = buildService();
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
    expect(service.settings.theme).toBe('default');
    expect(service.settings.showSettings).toBe(false);
  });

  it('should read persisted settings from localStorage', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '5');
    localStorage.setItem('theme', 'night');
    const service = buildService();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.titleFontSize).toBe('20');
    expect(service.settings.listSpacing).toBe('5');
    expect(service.settings.theme).toBe('night');
  });

  it('should dispatch a change event on initTheme when no theme is saved', () => {
    buildService();
    expect(mediaQueryList.dispatchEvent).toHaveBeenCalled();
  });

  it('should not dispatch a change event when a theme is saved', () => {
    localStorage.setItem('theme', 'night');
    const service = buildService();
    expect(service.settings.theme).toBe('night');
    expect(mediaQueryList.dispatchEvent).not.toHaveBeenCalled();
  });

  it('should set theme to night when the system prefers dark', () => {
    const service = buildService();
    service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('night');
  });

  it('should set theme to default when the system does not prefer dark', () => {
    const service = buildService();
    service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('default');
  });

  it('should register a change listener for the system color scheme', () => {
    buildService();
    expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('should remove the change listener on destroy', () => {
    const service = buildService();
    service.ngOnDestroy();
    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('should toggle settings visibility', () => {
    const service = buildService();
    expect(service.settings.showSettings).toBe(false);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('should toggle openLinkInNewTab and persist it', () => {
    const service = buildService();
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });

  it('should set the theme and persist it', () => {
    const service = buildService();
    service.setTheme('amoledblack');
    expect(service.settings.theme).toBe('amoledblack');
    expect(localStorage.getItem('theme')).toBe('amoledblack');
  });

  it('should set the font size and persist it', () => {
    const service = buildService();
    service.setFont('18');
    expect(service.settings.titleFontSize).toBe('18');
    expect(localStorage.getItem('titleFontSize')).toBe('18');
  });

  it('should set the list spacing and persist it', () => {
    const service = buildService();
    service.setSpacing('4');
    expect(service.settings.listSpacing).toBe('4');
    expect(localStorage.getItem('listSpacing')).toBe('4');
  });
});
