import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;
    let localStorageMock: { [key: string]: string };

    beforeEach(() => {
        localStorageMock = {};
        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            return localStorageMock[key] || null;
        });
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
            localStorageMock[key] = value;
        });
        service = new SettingsService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default settings', () => {
        expect(service.settings.showSettings).toBe(false);
        expect(service.settings.openLinkInNewTab).toBe(false);
        expect(service.settings.titleFontSize).toBe('16');
        expect(service.settings.listSpacing).toBe('0');
    });

    describe('toggleSettings', () => {
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
    });

    describe('toggleOpenLinksInNewTab', () => {
        it('should toggle openLinkInNewTab from false to true', () => {
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
    });

    describe('setTheme', () => {
        it('should set the theme', () => {
            service.setTheme('night');
            expect(service.settings.theme).toBe('night');
            expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
        });

        it('should set theme to default', () => {
            service.setTheme('default');
            expect(service.settings.theme).toBe('default');
            expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
        });
    });

    describe('setFont', () => {
        it('should set the font size', () => {
            service.setFont('20');
            expect(service.settings.titleFontSize).toBe('20');
            expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
        });
    });

    describe('setSpacing', () => {
        it('should set the list spacing', () => {
            service.setSpacing('10');
            expect(service.settings.listSpacing).toBe('10');
            expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '10');
        });
    });

    describe('handleSystemPreferredColorSchemeChange', () => {
        it('should set theme to night when dark mode is preferred', () => {
            const event = new MediaQueryListEvent('change', { matches: true });
            service.handleSystemPreferredColorSchemeChange(event);
            expect(service.settings.theme).toBe('night');
        });

        it('should set theme to default when light mode is preferred', () => {
            const event = new MediaQueryListEvent('change', { matches: false });
            service.handleSystemPreferredColorSchemeChange(event);
            expect(service.settings.theme).toBe('default');
        });
    });

    describe('initTheme', () => {
        it('should use saved theme from localStorage if available', () => {
            localStorageMock.theme = 'night';
            service.initTheme();
            expect(service.settings.theme).toBe('night');
        });
    });
});
