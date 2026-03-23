import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [SettingsService],
        });
        service = TestBed.inject(SettingsService);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default settings', () => {
        expect(service.settings).toBeDefined();
        expect(service.settings.showSettings).toBe(false);
        expect(service.settings.theme).toBeDefined();
        expect(service.settings.titleFontSize).toBe('16');
        expect(service.settings.listSpacing).toBe('0');
    });

    it('should toggle settings visibility', () => {
        expect(service.settings.showSettings).toBe(false);
        service.toggleSettings();
        expect(service.settings.showSettings).toBe(true);
        service.toggleSettings();
        expect(service.settings.showSettings).toBe(false);
    });

    it('should toggle open links in new tab', () => {
        const initial = service.settings.openLinkInNewTab;
        service.toggleOpenLinksInNewTab();
        expect(service.settings.openLinkInNewTab).toBe(!initial);
        expect(localStorage.getItem('openLinkInNewTab')).toBe(JSON.stringify(!initial));
    });

    it('should set theme', () => {
        service.setTheme('night');
        expect(service.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('should set font size', () => {
        service.setFont('20');
        expect(service.settings.titleFontSize).toBe('20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
    });

    it('should set spacing', () => {
        service.setSpacing('10');
        expect(service.settings.listSpacing).toBe('10');
        expect(localStorage.getItem('listSpacing')).toBe('10');
    });

    it('should load openLinkInNewTab from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        const freshService = new SettingsService();
        expect(freshService.settings.openLinkInNewTab).toBe(true);
    });

    it('should load titleFontSize from localStorage', () => {
        localStorage.setItem('titleFontSize', '24');
        const freshService = new SettingsService();
        expect(freshService.settings.titleFontSize).toBe('24');
    });

    it('should load listSpacing from localStorage', () => {
        localStorage.setItem('listSpacing', '5');
        const freshService = new SettingsService();
        expect(freshService.settings.listSpacing).toBe('5');
    });

    it('should handle system preferred color scheme change to dark', () => {
        const event = new MediaQueryListEvent('change', { matches: true, media: '(prefers-color-scheme: dark)' });
        service.handleSystemPreferredColorSchemeChange(event);
        expect(service.settings.theme).toBe('night');
    });

    it('should handle system preferred color scheme change to light', () => {
        const event = new MediaQueryListEvent('change', { matches: false, media: '(prefers-color-scheme: dark)' });
        service.handleSystemPreferredColorSchemeChange(event);
        expect(service.settings.theme).toBe('default');
    });

    it('should init theme from localStorage if saved', () => {
        localStorage.setItem('theme', 'night');
        const freshService = new SettingsService();
        expect(freshService.settings.theme).toBe('night');
    });

    it('should subscribe to system preferred color scheme', () => {
        spyOn(service.darkColorSchemeMedia, 'addEventListener');
        service.subscribeToSystemPreferredColorScheme();
        expect(service.darkColorSchemeMedia.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });

    it('should unsubscribe from system preferred color scheme', () => {
        spyOn(service.darkColorSchemeMedia, 'removeEventListener');
        service.unSubscribeToSystemPrefferedColorScheme();
        expect(service.darkColorSchemeMedia.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });

    it('should call unsubscribe on ngOnDestroy', () => {
        spyOn(service, 'unSubscribeToSystemPrefferedColorScheme');
        service.ngOnDestroy();
        expect(service.unSubscribeToSystemPrefferedColorScheme).toHaveBeenCalled();
    });
});
