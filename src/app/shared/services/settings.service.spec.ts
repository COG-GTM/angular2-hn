import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let prefersDark: boolean;
  let mediaListeners: Array<(e: MediaQueryListEvent) => void>;

  // SettingsService reads localStorage and matchMedia during field initialisation,
  // so the mocks must be in place before TestBed creates it.
  function createService(): SettingsService {
    TestBed.configureTestingModule({});
    return TestBed.inject(SettingsService);
  }

  function emitColorScheme(matches: boolean) {
    const event = new MediaQueryListEvent('change', { media: '(prefers-color-scheme: dark)', matches });
    mediaListeners.forEach(listener => listener(event));
  }

  beforeEach(() => {
    store = {};
    prefersDark = false;
    mediaListeners = [];

    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
    spyOn(Storage.prototype, 'setItem').and.callFake((key: string, value: string) => (store[key] = String(value)));

    spyOn(window, 'matchMedia').and.callFake((media: string) => {
      const mql = {
        media,
        get matches() {
          return prefersDark;
        },
        addEventListener: (eventType: string, listener: any) => mediaListeners.push(listener),
        removeEventListener: jasmine.createSpy('removeEventListener'),
        dispatchEvent: (event: MediaQueryListEvent) => {
          mediaListeners.forEach(listener => listener(event));
          return true;
        },
      };
      return mql as any;
    });
  });

  describe('defaults', () => {
    it('uses default settings when nothing is stored and the system prefers light', () => {
      const service = createService();
      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
      });
    });

    it('queries the dark color scheme media', () => {
      createService();
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('persists the system-derived theme on first load', () => {
      createService();
      expect(store.theme).toBe('default');
    });

    it('starts with the night theme when the system prefers dark', () => {
      prefersDark = true;
      const service = createService();
      expect(service.settings.theme).toBe('night');
      expect(store.theme).toBe('night');
    });
  });

  describe('restoring from localStorage', () => {
    it('restores every persisted setting', () => {
      store = {
        openLinkInNewTab: 'true',
        titleFontSize: '20',
        listSpacing: '8',
        theme: 'amoledblack',
      };
      const service = createService();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('20');
      expect(service.settings.listSpacing).toBe('8');
      expect(service.settings.theme).toBe('amoledblack');
    });

    it('prefers a saved theme over the system color scheme', () => {
      prefersDark = true;
      store = { theme: 'default' };
      const service = createService();
      expect(service.settings.theme).toBe('default');
    });

    it('parses a stored false for openLinkInNewTab', () => {
      store = { openLinkInNewTab: 'false' };
      expect(createService().settings.openLinkInNewTab).toBe(false);
    });
  });

  describe('setters', () => {
    let service: SettingsService;

    beforeEach(() => {
      service = createService();
    });

    it('toggleSettings flips showSettings without persisting it', () => {
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
      expect('showSettings' in store).toBe(false);
    });

    it('toggleOpenLinksInNewTab flips and persists as JSON', () => {
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(store.openLinkInNewTab).toBe('true');
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(store.openLinkInNewTab).toBe('false');
    });

    ['default', 'night', 'amoledblack'].forEach(theme => {
      it(`setTheme switches to and persists "${theme}"`, () => {
        service.setTheme(theme);
        expect(service.settings.theme).toBe(theme);
        expect(store.theme).toBe(theme);
      });
    });

    it('setFont updates and persists the title font size', () => {
      service.setFont('22');
      expect(service.settings.titleFontSize).toBe('22');
      expect(store.titleFontSize).toBe('22');
    });

    it('setSpacing updates and persists the list spacing', () => {
      service.setSpacing('12');
      expect(service.settings.listSpacing).toBe('12');
      expect(store.listSpacing).toBe('12');
    });

    it('persisted values survive a new service instance', () => {
      service.setTheme('night');
      service.setFont('18');
      service.setSpacing('4');
      service.toggleOpenLinksInNewTab();

      TestBed.resetTestingModule();
      const reloaded = createService();
      expect(reloaded.settings).toEqual(
        jasmine.objectContaining({ theme: 'night', titleFontSize: '18', listSpacing: '4', openLinkInNewTab: true })
      );
    });
  });

  describe('system color scheme changes', () => {
    it('switches to night when the system goes dark and back to default when it goes light', () => {
      const service = createService();
      emitColorScheme(true);
      expect(service.settings.theme).toBe('night');
      expect(store.theme).toBe('night');
      emitColorScheme(false);
      expect(service.settings.theme).toBe('default');
    });

    it('unsubscribes from the media query on destroy', () => {
      const service = createService();
      service.ngOnDestroy();
      expect(service.darkColorSchemeMedia.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });
});
