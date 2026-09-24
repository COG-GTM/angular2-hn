import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('with no saved settings', () => {
    beforeEach(() => {
      service = new SettingsService();
    });

    it('uses defaults', () => {
      expect(service.settings.showSettings).toBe(false);
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(service.settings.titleFontSize).toBe('16');
      expect(service.settings.listSpacing).toBe('0');
    });

    it('derives the initial theme from the system color scheme', () => {
      const expected = service.darkColorSchemeMedia.matches ? 'night' : 'default';
      expect(service.settings.theme).toBe(expected);
      expect(localStorage.getItem('theme')).toBe(expected);
    });

    it('toggles the settings panel', () => {
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
    });

    it('toggles open-in-new-tab and persists it', () => {
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('sets and persists the theme', () => {
      service.setTheme('amoledblack');
      expect(service.settings.theme).toBe('amoledblack');
      expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('sets and persists the font size', () => {
      service.setFont('20');
      expect(service.settings.titleFontSize).toBe('20');
      expect(localStorage.getItem('titleFontSize')).toBe('20');
    });

    it('sets and persists the list spacing', () => {
      service.setSpacing('8');
      expect(service.settings.listSpacing).toBe('8');
      expect(localStorage.getItem('listSpacing')).toBe('8');
    });

    it('switches theme when the system color scheme changes', () => {
      service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('night');
      service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('default');
    });

    it('removes the media listener on destroy', () => {
      const spy = spyOn(service.darkColorSchemeMedia, 'removeEventListener');
      service.ngOnDestroy();
      expect(spy).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });

  describe('with saved settings', () => {
    it('restores persisted values from localStorage', () => {
      localStorage.setItem('theme', 'night');
      localStorage.setItem('openLinkInNewTab', 'true');
      localStorage.setItem('titleFontSize', '22');
      localStorage.setItem('listSpacing', '4');

      service = new SettingsService();

      expect(service.settings.theme).toBe('night');
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('22');
      expect(service.settings.listSpacing).toBe('4');
    });
  });
});
