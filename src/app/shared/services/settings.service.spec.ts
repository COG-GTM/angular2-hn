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
    expect(service.settings).toBeDefined();
    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.theme).toBeDefined();
  });

  it('should toggle settings visibility', () => {
    const initialState = service.settings.showSettings;
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(!initialState);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(initialState);
  });

  it('should toggle open links in new tab and persist to localStorage', () => {
    const initialState = service.settings.openLinkInNewTab;
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(!initialState);
    expect(localStorage.getItem('openLinkInNewTab')).toBe(JSON.stringify(!initialState));
  });

  it('should set theme and persist to localStorage', () => {
    service.setTheme('night');
    expect(service.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('should set font size and persist to localStorage', () => {
    service.setFont('18');
    expect(service.settings.titleFontSize).toBe('18');
    expect(localStorage.getItem('titleFontSize')).toBe('18');
  });

  it('should set spacing and persist to localStorage', () => {
    service.setSpacing('10');
    expect(service.settings.listSpacing).toBe('10');
    expect(localStorage.getItem('listSpacing')).toBe('10');
  });

  it('should load saved theme from localStorage on init', () => {
    localStorage.setItem('theme', 'night');
    const newService = new SettingsService();
    expect(newService.settings.theme).toBe('night');
  });

  it('should load saved font size from localStorage on init', () => {
    localStorage.setItem('titleFontSize', '20');
    const newService = new SettingsService();
    expect(newService.settings.titleFontSize).toBe('20');
  });

  it('should load saved list spacing from localStorage on init', () => {
    localStorage.setItem('listSpacing', '5');
    const newService = new SettingsService();
    expect(newService.settings.listSpacing).toBe('5');
  });

  it('should load saved openLinkInNewTab from localStorage on init', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    const newService = new SettingsService();
    expect(newService.settings.openLinkInNewTab).toBe(true);
  });

  it('should handle invalid theme value in localStorage', () => {
    localStorage.setItem('theme', 'invalid-theme');
    const newService = new SettingsService();
    expect(newService.settings.theme).toBeDefined();
  });

  it('should handle all theme options', () => {
    service.setTheme('default');
    expect(service.settings.theme).toBe('default');
    
    service.setTheme('night');
    expect(service.settings.theme).toBe('night');
    
    service.setTheme('black');
    expect(service.settings.theme).toBe('black');
  });

  it('should persist multiple setting changes', () => {
    service.setTheme('night');
    service.setFont('20');
    service.setSpacing('15');
    service.toggleOpenLinksInNewTab();
    
    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
    expect(localStorage.getItem('listSpacing')).toBe('15');
    expect(localStorage.getItem('openLinkInNewTab')).toBeTruthy();
  });

  it('should handle edge case font sizes', () => {
    service.setFont('12');
    expect(service.settings.titleFontSize).toBe('12');
    
    service.setFont('24');
    expect(service.settings.titleFontSize).toBe('24');
  });

  it('should handle edge case list spacing values', () => {
    service.setSpacing('0');
    expect(service.settings.listSpacing).toBe('0');
    
    service.setSpacing('20');
    expect(service.settings.listSpacing).toBe('20');
  });
});
