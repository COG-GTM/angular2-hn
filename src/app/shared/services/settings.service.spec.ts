import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockLocalStorage: { [key: string]: string };
  let mockMatchMedia: any;
  let matchMediaEventListener: ((event: MediaQueryListEvent) => void) | undefined;

  beforeEach(() => {
    mockLocalStorage = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    matchMediaEventListener = undefined;
    mockMatchMedia = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jasmine.createSpy('addEventListener').and.callFake((event: string, handler: any) => {
        matchMediaEventListener = handler;
      }),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent').and.callFake((event: MediaQueryListEvent) => {
        if (matchMediaEventListener) {
          matchMediaEventListener(event);
        }
      })
    };

    spyOn(window, 'matchMedia').and.returnValue(mockMatchMedia as any);

    TestBed.configureTestingModule({
      providers: [SettingsService]
    });
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      service = TestBed.inject(SettingsService);
      expect(service).toBeTruthy();
    });

    it('should initialize with default settings when localStorage is empty', () => {
      service = TestBed.inject(SettingsService);
      
      expect(service.settings.showSettings).toBe(false);
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(service.settings.theme).toBe('default');
      expect(service.settings.titleFontSize).toBe('16');
      expect(service.settings.listSpacing).toBe('0');
    });

    it('should load settings from localStorage when available', () => {
      mockLocalStorage['openLinkInNewTab'] = 'true';
      mockLocalStorage['titleFontSize'] = '18';
      mockLocalStorage['listSpacing'] = '10';

      service = TestBed.inject(SettingsService);

      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('18');
      expect(service.settings.listSpacing).toBe('10');
    });

    it('should call subscribeToSystemPreferredColorScheme on construction', () => {
      service = TestBed.inject(SettingsService);
      
      expect(mockMatchMedia.addEventListener).toHaveBeenCalledWith(
        'change',
        jasmine.any(Function)
      );
    });

    it('should call initTheme on construction', () => {
      mockMatchMedia.matches = true;
      
      service = TestBed.inject(SettingsService);
      
      expect(mockMatchMedia.dispatchEvent).toHaveBeenCalled();
    });
  });

  describe('localStorage persistence', () => {
    beforeEach(() => {
      service = TestBed.inject(SettingsService);
    });

    it('should save openLinkInNewTab to localStorage when toggled', () => {
      service.settings.openLinkInNewTab = false;
      
      service.toggleOpenLinksInNewTab();
      
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
    });

    it('should toggle openLinkInNewTab from true to false', () => {
      service.settings.openLinkInNewTab = true;
      
      service.toggleOpenLinksInNewTab();
      
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
    });

    it('should save theme to localStorage', () => {
      service.setTheme('night');
      
      expect(service.settings.theme).toBe('night');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('should save titleFontSize to localStorage', () => {
      service.setFont('20');
      
      expect(service.settings.titleFontSize).toBe('20');
      expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
    });

    it('should save listSpacing to localStorage', () => {
      service.setSpacing('15');
      
      expect(service.settings.listSpacing).toBe('15');
      expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '15');
    });
  });

  describe('System color scheme detection', () => {
    beforeEach(() => {
      service = TestBed.inject(SettingsService);
    });

    it('should set theme to night when system prefers dark mode', () => {
      const event = new MediaQueryListEvent('change', {
        media: '(prefers-color-scheme: dark)',
        matches: true
      });

      service.handleSystemPreferredColorSchemeChange(event);

      expect(service.settings.theme).toBe('night');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('should set theme to default when system does not prefer dark mode', () => {
      const event = new MediaQueryListEvent('change', {
        media: '(prefers-color-scheme: dark)',
        matches: false
      });

      service.handleSystemPreferredColorSchemeChange(event);

      expect(service.settings.theme).toBe('default');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
    });

    it('should subscribe to system color scheme changes', () => {
      service.subscribeToSystemPreferredColorScheme();

      expect(mockMatchMedia.addEventListener).toHaveBeenCalledWith(
        'change',
        jasmine.any(Function)
      );
    });

    it('should unsubscribe from system color scheme changes', () => {
      service.unSubscribeToSystemPrefferedColorScheme();

      expect(mockMatchMedia.removeEventListener).toHaveBeenCalledWith(
        'change',
        jasmine.any(Function)
      );
    });

    it('should respond to actual color scheme change events', () => {
      const event = new MediaQueryListEvent('change', {
        media: '(prefers-color-scheme: dark)',
        matches: true
      });

      mockMatchMedia.dispatchEvent(event);

      expect(service.settings.theme).toBe('night');
    });
  });

  describe('Theme initialization', () => {
    it('should use saved theme from localStorage when available', () => {
      mockLocalStorage['theme'] = 'night';

      service = TestBed.inject(SettingsService);

      expect(service.settings.theme).toBe('night');
      expect(mockMatchMedia.dispatchEvent).not.toHaveBeenCalled();
    });

    it('should dispatch event to detect system preference when no saved theme', () => {
      service = TestBed.inject(SettingsService);

      expect(mockMatchMedia.dispatchEvent).toHaveBeenCalled();
    });

    it('should set theme based on system preference when no saved theme', () => {
      mockMatchMedia.matches = true;

      service = TestBed.inject(SettingsService);

      expect(service.settings.theme).toBe('night');
    });

    it('should set default theme when system does not prefer dark and no saved theme', () => {
      mockMatchMedia.matches = false;

      service = TestBed.inject(SettingsService);

      expect(service.settings.theme).toBe('default');
    });
  });

  describe('Settings methods', () => {
    beforeEach(() => {
      service = TestBed.inject(SettingsService);
    });

    it('should toggle showSettings from false to true', () => {
      service.settings.showSettings = false;

      service.toggleSettings();

      expect(service.settings.showSettings).toBe(true);
    });

    it('should toggle showSettings from true to false', () => {
      service.settings.showSettings = true;

      service.toggleSettings();

      expect(service.settings.showSettings).toBe(false);
    });

    it('should set theme correctly', () => {
      service.setTheme('night');

      expect(service.settings.theme).toBe('night');
    });

    it('should set font size correctly', () => {
      service.setFont('22');

      expect(service.settings.titleFontSize).toBe('22');
    });

    it('should set list spacing correctly', () => {
      service.setSpacing('20');

      expect(service.settings.listSpacing).toBe('20');
    });
  });

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      service = TestBed.inject(SettingsService);
    });

    it('should unsubscribe from color scheme changes on destroy', () => {
      service.ngOnDestroy();

      expect(mockMatchMedia.removeEventListener).toHaveBeenCalledWith(
        'change',
        jasmine.any(Function)
      );
    });
  });
});
