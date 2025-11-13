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
    expect(service.settings.theme).toBe('default');
  });

  it('should toggle realtime updates', () => {
    const initialValue = service.settings.realtimeUpdates;
    service.toggleRealtimeUpdates();
    expect(service.settings.realtimeUpdates).toBe(!initialValue);
  });

  it('should persist realtime updates setting to localStorage', () => {
    service.toggleRealtimeUpdates();
    const storedValue = localStorage.getItem('realtimeUpdates');
    expect(storedValue).toBe(JSON.stringify(service.settings.realtimeUpdates));
  });

  it('should load realtime updates setting from localStorage', () => {
    localStorage.setItem('realtimeUpdates', 'true');
    const newService = new SettingsService();
    expect(newService.settings.realtimeUpdates).toBe(true);
  });

  it('should toggle settings visibility', () => {
    const initialValue = service.settings.showSettings;
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(!initialValue);
  });

  it('should toggle open links in new tab', () => {
    const initialValue = service.settings.openLinkInNewTab;
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(!initialValue);
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
});
