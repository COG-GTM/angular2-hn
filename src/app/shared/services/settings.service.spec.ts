import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

class FakeMediaQueryList extends EventTarget {
  readonly media = '(prefers-color-scheme: dark)';

  constructor(public matches: boolean) {
    super();
  }
}

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let media: FakeMediaQueryList;

  function createService(systemPrefersDark = false): SettingsService {
    media = new FakeMediaQueryList(systemPrefersDark);
    spyOn(window, 'matchMedia').and.returnValue(media as any);
    return TestBed.inject(SettingsService);
  }

  beforeEach(() => {
    store = {};
    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
    spyOn(Storage.prototype, 'setItem').and.callFake((key: string, value: string) => (store[key] = String(value)));

    TestBed.configureTestingModule({});
  });

  describe('defaults', () => {
    it('should use default settings when nothing is persisted', () => {
      const service = createService();

      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
      });
    });

    it('should query the system dark color scheme', () => {
      createService();

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should persist the "default" theme when the system prefers a light scheme', () => {
      createService(false);

      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
      expect(store.theme).toBe('default');
    });

    it('should pick the "night" theme when the system prefers a dark scheme', () => {
      const service = createService(true);

      expect(service.settings.theme).toBe('night');
      expect(store.theme).toBe('night');
    });
  });

  describe('restoring persisted settings', () => {
    it('should read settings from localStorage', () => {
      store = {
        openLinkInNewTab: 'true',
        titleFontSize: '20',
        listSpacing: '8',
        theme: 'amoledblack',
      };

      const service = createService(true);

      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('20');
      expect(service.settings.listSpacing).toBe('8');
      expect(service.settings.theme).toBe('amoledblack');
    });

    it('should not override a saved theme with the system preference', () => {
      store = { theme: 'default' };

      const service = createService(true);

      expect(service.settings.theme).toBe('default');
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should parse a persisted "false" for openLinkInNewTab', () => {
      store = { openLinkInNewTab: 'false' };

      expect(createService().settings.openLinkInNewTab).toBe(false);
    });
  });

  describe('system color scheme changes', () => {
    it('should switch to "night" when the system switches to dark', () => {
      const service = createService(false);

      media.dispatchEvent(new MediaQueryListEvent('change', { media: media.media, matches: true }));

      expect(service.settings.theme).toBe('night');
      expect(store.theme).toBe('night');
    });

    it('should switch back to "default" when the system switches to light', () => {
      const service = createService(true);

      media.dispatchEvent(new MediaQueryListEvent('change', { media: media.media, matches: false }));

      expect(service.settings.theme).toBe('default');
      expect(store.theme).toBe('default');
    });

    it('should remove the media listener on destroy', () => {
      const service = createService();
      spyOn(media, 'removeEventListener');

      service.ngOnDestroy();

      expect(media.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });

  describe('setters', () => {
    let service: SettingsService;

    beforeEach(() => {
      service = createService();
    });

    it('toggleSettings should toggle the settings panel without persisting', () => {
      (localStorage.setItem as jasmine.Spy).calls.reset();

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('toggleOpenLinksInNewTab should toggle and persist the flag as JSON', () => {
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(store.openLinkInNewTab).toBe('true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(store.openLinkInNewTab).toBe('false');
    });

    it('setTheme should update and persist the theme', () => {
      service.setTheme('amoledblack');

      expect(service.settings.theme).toBe('amoledblack');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'amoledblack');
    });

    it('setFont should update and persist the title font size', () => {
      service.setFont('22');

      expect(service.settings.titleFontSize).toBe('22');
      expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '22');
    });

    it('setSpacing should update and persist the list spacing', () => {
      service.setSpacing('12');

      expect(service.settings.listSpacing).toBe('12');
      expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '12');
    });
  });
});
