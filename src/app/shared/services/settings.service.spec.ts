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

  it('should load settings from localStorage', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '18');
    localStorage.setItem('listSpacing', '5');
    localStorage.setItem('realtimeUpdates', 'true');

    const newService = new SettingsService();

    expect(newService.settings.openLinkInNewTab).toBe(true);
    expect(newService.settings.titleFontSize).toBe('18');
    expect(newService.settings.listSpacing).toBe('5');
    expect(newService.settings.realtimeUpdates).toBe(true);
  });

  it('should toggle settings visibility', () => {
    expect(service.settings.showSettings).toBe(false);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
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

  it('should toggle realtime updates', () => {
    expect(service.settings.realtimeUpdates).toBe(false);
    service.toggleRealtimeUpdates();
    expect(service.settings.realtimeUpdates).toBe(true);
    expect(localStorage.getItem('realtimeUpdates')).toBe('true');

    service.toggleRealtimeUpdates();
    expect(service.settings.realtimeUpdates).toBe(false);
    expect(localStorage.getItem('realtimeUpdates')).toBe('false');
  });

  it('should set theme', () => {
    service.setTheme('night');
    expect(service.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');

    service.setTheme('amoledblack');
    expect(service.settings.theme).toBe('amoledblack');
    expect(localStorage.getItem('theme')).toBe('amoledblack');
  });

  it('should set font size', () => {
    service.setFont('20');
    expect(service.settings.titleFontSize).toBe('20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
  });

  it('should set list spacing', () => {
    service.setSpacing('10');
    expect(service.settings.listSpacing).toBe('10');
    expect(localStorage.getItem('listSpacing')).toBe('10');
  });

  it('should persist realtime updates setting across service instances', () => {
    service.toggleRealtimeUpdates();
    expect(service.settings.realtimeUpdates).toBe(true);

    const newService = new SettingsService();
    expect(newService.settings.realtimeUpdates).toBe(true);
  });
});
