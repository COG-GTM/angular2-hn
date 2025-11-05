import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let localStorageMock: { [key: string]: string };
  let mockMediaQueryList: any;

  beforeEach(() => {
    localStorageMock = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return localStorageMock[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    mockMediaQueryList = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent')
    };

    spyOn(window, 'matchMedia').and.returnValue(mockMediaQueryList);

    TestBed.configureTestingModule({
      providers: [SettingsService]
    });
  });

  it('should be created', () => {
    service = TestBed.inject(SettingsService);
    expect(service).toBeTruthy();
  });

  it('should initialize with default settings', () => {
    service = TestBed.inject(SettingsService);
    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.theme).toBe('default');
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
  });

  it('should load settings from localStorage', () => {
    localStorageMock['openLinkInNewTab'] = 'true';
    localStorageMock['titleFontSize'] = '18';
    localStorageMock['listSpacing'] = '5';

    service = TestBed.inject(SettingsService);

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.titleFontSize).toBe('18');
    expect(service.settings.listSpacing).toBe('5');
  });

  it('should subscribe to system preferred color scheme', () => {
    service = TestBed.inject(SettingsService);
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      'change',
      jasmine.any(Function)
    );
  });

  it('should toggle settings visibility', () => {
    service = TestBed.inject(SettingsService);
    const initialValue = service.settings.showSettings;
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(!initialValue);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(initialValue);
  });

  it('should toggle openLinkInNewTab and save to localStorage', () => {
    service = TestBed.inject(SettingsService);
    service.settings.openLinkInNewTab = false;

    service.toggleOpenLinksInNewTab();

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
  });

  it('should set theme and save to localStorage', () => {
    service = TestBed.inject(SettingsService);

    service.setTheme('night');

    expect(service.settings.theme).toBe('night');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
  });

  it('should set font size and save to localStorage', () => {
    service = TestBed.inject(SettingsService);

    service.setFont('20');

    expect(service.settings.titleFontSize).toBe('20');
    expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
  });

  it('should set spacing and save to localStorage', () => {
    service = TestBed.inject(SettingsService);

    service.setSpacing('10');

    expect(service.settings.listSpacing).toBe('10');
    expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '10');
  });

  it('should handle system preferred color scheme change to dark', () => {
    service = TestBed.inject(SettingsService);
    const event = { matches: true } as MediaQueryListEvent;

    service.handleSystemPreferredColorSchemeChange(event);

    expect(service.settings.theme).toBe('night');
  });

  it('should handle system preferred color scheme change to light', () => {
    service = TestBed.inject(SettingsService);
    const event = { matches: false } as MediaQueryListEvent;

    service.handleSystemPreferredColorSchemeChange(event);

    expect(service.settings.theme).toBe('default');
  });

  it('should load saved theme from localStorage', () => {
    localStorageMock['theme'] = 'night';

    service = TestBed.inject(SettingsService);

    expect(service.settings.theme).toBe('night');
  });

  it('should unsubscribe from system preferred color scheme on destroy', () => {
    service = TestBed.inject(SettingsService);

    service.ngOnDestroy();

    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      'change',
      jasmine.any(Function)
    );
  });
});
