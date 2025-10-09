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

  it('should initialize with default settings', () => {
    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.theme).toBeDefined();
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
  });

  describe('theme management', () => {
    it('should set theme and persist to localStorage', () => {
      const theme = 'night';
      service.setTheme(theme);
      
      expect(service.settings.theme).toBe(theme);
      expect(localStorage.getItem('theme')).toBe(theme);
    });

    it('should load saved theme from localStorage', () => {
      localStorage.setItem('theme', 'night');
      const newService = new SettingsService();
      
      expect(newService.settings.theme).toBe('night');
    });
  });

  describe('toggleSettings', () => {
    it('should toggle showSettings', () => {
      const initialValue = service.settings.showSettings;
      service.toggleSettings();
      
      expect(service.settings.showSettings).toBe(!initialValue);
      
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(initialValue);
    });
  });

  describe('toggleOpenLinksInNewTab', () => {
    it('should toggle openLinkInNewTab and persist to localStorage', () => {
      service.settings.openLinkInNewTab = false;
      service.toggleOpenLinksInNewTab();
      
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
      
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });
  });

  describe('setFont', () => {
    it('should set font size and persist to localStorage', () => {
      const fontSize = '18';
      service.setFont(fontSize);
      
      expect(service.settings.titleFontSize).toBe(fontSize);
      expect(localStorage.getItem('titleFontSize')).toBe(fontSize);
    });
  });

  describe('setSpacing', () => {
    it('should set list spacing and persist to localStorage', () => {
      const spacing = '10';
      service.setSpacing(spacing);
      
      expect(service.settings.listSpacing).toBe(spacing);
      expect(localStorage.getItem('listSpacing')).toBe(spacing);
    });
  });
});
