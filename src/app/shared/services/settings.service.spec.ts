import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;

    beforeEach(() => {
        localStorage.clear();
        service = new SettingsService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default settings', () => {
        expect(service.settings.showSettings).toBe(false);
        expect(service.settings.theme).toBeDefined();
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

    it('should set theme to default', () => {
        service.setTheme('default');
        expect(service.settings.theme).toBe('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('should set theme to amoledblack', () => {
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

    it('should read openLinkInNewTab from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        const newService = new SettingsService();
        expect(newService.settings.openLinkInNewTab).toBe(true);
    });

    it('should read titleFontSize from localStorage', () => {
        localStorage.setItem('titleFontSize', '24');
        const newService = new SettingsService();
        expect(newService.settings.titleFontSize).toBe('24');
    });

    it('should read listSpacing from localStorage', () => {
        localStorage.setItem('listSpacing', '5');
        const newService = new SettingsService();
        expect(newService.settings.listSpacing).toBe('5');
    });

    it('should use default titleFontSize when localStorage is empty', () => {
        expect(service.settings.titleFontSize).toBe('16');
    });

    it('should use default listSpacing when localStorage is empty', () => {
        expect(service.settings.listSpacing).toBe('0');
    });

    it('should init theme from localStorage if saved', () => {
        localStorage.setItem('theme', 'night');
        const newService = new SettingsService();
        expect(newService.settings.theme).toBe('night');
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

    it('should call subscribeToSystemPreferredColorScheme in constructor', () => {
        spyOn(SettingsService.prototype, 'subscribeToSystemPreferredColorScheme');
        const newService = new SettingsService();
        expect(SettingsService.prototype.subscribeToSystemPreferredColorScheme).toHaveBeenCalled();
    });

    it('should unsubscribe on ngOnDestroy', () => {
        spyOn(service.darkColorSchemeMedia, 'removeEventListener');
        service.ngOnDestroy();
        expect(service.darkColorSchemeMedia.removeEventListener).toHaveBeenCalled();
    });
});
