import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let media: any;
  let changeHandler: (event: any) => void;

  beforeEach(() => {
    localStorage.clear();
    changeHandler = undefined;
    media = {
      media: '(prefers-color-scheme: dark)',
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener').and.callFake((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      }),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: (event) => {
        if (changeHandler) {
          changeHandler(event);
        }
        return true;
      }
    };
    spyOn(window, 'matchMedia').and.returnValue(media);
  });

  it('uses default settings when nothing is persisted', () => {
    const service = new SettingsService();

    expect(service.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      titleFontSize: '16',
      listSpacing: '0',
      theme: 'default'
    });
  });

  it('reads persisted settings', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '4');
    localStorage.setItem('theme', 'amoledblack');

    const service = new SettingsService();

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.titleFontSize).toBe('20');
    expect(service.settings.listSpacing).toBe('4');
    expect(service.settings.theme).toBe('amoledblack');
  });

  it('uses the system dark preference when no theme is saved', () => {
    media.matches = true;

    const service = new SettingsService();

    expect(service.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('uses the system light preference when no theme is saved', () => {
    const service = new SettingsService();

    expect(service.settings.theme).toBe('default');
  });

  it('prefers a saved theme over the system preference', () => {
    localStorage.setItem('theme', 'amoledblack');
    media.matches = true;

    const service = new SettingsService();

    expect(service.settings.theme).toBe('amoledblack');
  });

  it('handles system color scheme changes', () => {
    const service = new SettingsService();

    service.handleSystemPreferredColorSchemeChange({matches: true} as any);
    expect(service.settings.theme).toBe('night');
    service.handleSystemPreferredColorSchemeChange({matches: false} as any);
    expect(service.settings.theme).toBe('default');
  });

  it('toggles settings visibility', () => {
    const service = new SettingsService();

    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('toggles and persists opening links in a new tab', () => {
    const service = new SettingsService();

    service.toggleOpenLinksInNewTab();

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('updates and persists theme, font, and spacing settings', () => {
    const service = new SettingsService();

    service.setTheme('night');
    service.setFont('18');
    service.setSpacing('6');

    expect(service.settings.theme).toBe('night');
    expect(service.settings.titleFontSize).toBe('18');
    expect(service.settings.listSpacing).toBe('6');
    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('titleFontSize')).toBe('18');
    expect(localStorage.getItem('listSpacing')).toBe('6');
  });

  it('unsubscribes from system color scheme changes on destroy', () => {
    const service = new SettingsService();

    service.ngOnDestroy();

    expect(media.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('registers a change listener for the system color scheme', () => {
    const service = new SettingsService();

    service.subscribeToSystemPreferredColorScheme();

    expect(media.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });
});
