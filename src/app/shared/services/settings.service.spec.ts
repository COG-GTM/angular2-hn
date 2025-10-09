import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    
    TestBed.configureTestingModule({
      providers: [SettingsService]
    });
    service = TestBed.inject(SettingsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('theme management', () => {
    it('should initialize with default theme', () => {
      expect(service.settings.theme).toBeDefined();
    });

    it('should set theme and save to localStorage', () => {
      service.setTheme('night');
      expect(service.settings.theme).toBe('night');
      expect(localStorage.getItem('theme')).toBe('night');
    });

    it('should set theme to black-AMOLED', () => {
      service.setTheme('black-AMOLED');
      expect(service.settings.theme).toBe('black-AMOLED');
      expect(localStorage.getItem('theme')).toBe('black-AMOLED');
    });

    it('should initialize theme from localStorage if available', () => {
      localStorage.setItem('theme', 'night');
      service.initTheme();
      expect(service.settings.theme).toBe('night');
    });
  });

  describe('settings toggle', () => {
    it('should toggle settings visibility', () => {
      const initialState = service.settings.showSettings;
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(!initialState);
    });

    it('should toggle open links in new tab', () => {
      const initialState = service.settings.openLinkInNewTab;
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(!initialState);
    });
  });

  describe('localStorage interactions', () => {
    it('should save open in new tab setting to localStorage', () => {
      service.settings.openLinkInNewTab = true;
      service.toggleOpenLinksInNewTab();
      expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('should load open in new tab setting from localStorage', () => {
      localStorage.setItem('openLinkInNewTab', 'true');
      service = TestBed.inject(SettingsService);
      expect(service.settings.openLinkInNewTab).toBe(true);
    });
  });

  describe('font size', () => {
    it('should have default font size', () => {
      expect(service.settings.titleFontSize).toBeDefined();
      expect(typeof service.settings.titleFontSize).toBe('string');
    });

    it('should save font size to localStorage', () => {
      service.setFont('18');
      expect(localStorage.getItem('titleFontSize')).toBe('18');
    });
  });

  describe('list spacing', () => {
    it('should have default list spacing', () => {
      expect(service.settings.listSpacing).toBeDefined();
      expect(typeof service.settings.listSpacing).toBe('string');
    });

    it('should save list spacing to localStorage', () => {
      service.setSpacing('5');
      expect(localStorage.getItem('listSpacing')).toBe('5');
    });
  });
});
