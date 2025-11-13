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
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.theme).toBe('default');
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
    expect(service.settings.realtimeUpdates).toBe(false);
  });

  it('should toggle settings visibility', () => {
    const initialState = service.settings.showSettings;
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(!initialState);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(initialState);
  });

  it('should toggle open links in new tab', () => {
    expect(service.settings.openLinkInNewTab).toBe(false);
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
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

  it('should set list spacing and persist to localStorage', () => {
    service.setSpacing('10');
    expect(service.settings.listSpacing).toBe('10');
    expect(localStorage.getItem('listSpacing')).toBe('10');
  });

  it('should toggle realtime updates', () => {
    expect(service.settings.realtimeUpdates).toBe(false);
    service.toggleRealtimeUpdates();
    expect(service.settings.realtimeUpdates).toBe(true);
    expect(localStorage.getItem('realtimeUpdates')).toBe('true');
    service.toggleRealtimeUpdates();
    expect(service.settings.realtimeUpdates).toBe(false);
    expect(localStorage.getItem('realtimeUpdates')).toBe('false');
  });

  it('should get realtime updates setting', () => {
    expect(service.getRealtimeUpdates()).toBe(false);
    service.toggleRealtimeUpdates();
    expect(service.getRealtimeUpdates()).toBe(true);
  });

  it('should load realtime updates setting from localStorage', () => {
    localStorage.setItem('realtimeUpdates', 'true');
    const newService = new SettingsService();
    expect(newService.settings.realtimeUpdates).toBe(true);
  });

  it('should load openLinkInNewTab setting from localStorage', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    const newService = new SettingsService();
    expect(newService.settings.openLinkInNewTab).toBe(true);
  });

  it('should load theme setting from localStorage', () => {
    localStorage.setItem('theme', 'night');
    const newService = new SettingsService();
    expect(newService.settings.theme).toBe('night');
  });

  it('should load titleFontSize setting from localStorage', () => {
    localStorage.setItem('titleFontSize', '20');
    const newService = new SettingsService();
    expect(newService.settings.titleFontSize).toBe('20');
  });

  it('should load listSpacing setting from localStorage', () => {
    localStorage.setItem('listSpacing', '15');
    const newService = new SettingsService();
    expect(newService.settings.listSpacing).toBe('15');
  });

  it('should handle system preferred color scheme change', () => {
    const event = new MediaQueryListEvent('change', {
      media: '(prefers-color-scheme: dark)',
      matches: true
    });
    service.handleSystemPreferredColorSchemeChange(event);
    expect(service.settings.theme).toBe('night');
  });

  it('should set default theme when system prefers light', () => {
    const event = new MediaQueryListEvent('change', {
      media: '(prefers-color-scheme: dark)',
      matches: false
    });
    service.handleSystemPreferredColorSchemeChange(event);
    expect(service.settings.theme).toBe('default');
  });
});
