import { TestBed } from '@angular/core/testing';
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

        TestBed.configureTestingModule({
            providers: [SettingsService],
        });

        service = TestBed.inject(SettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('settings initialization', () => {
        it('should have default settings', () => {
            expect(service.settings).toBeDefined();
            expect(service.settings.showSettings).toBe(false);
            expect(service.settings.theme).toBeDefined();
        });

        it('should have default titleFontSize of 16', () => {
            expect(service.settings.titleFontSize).toBe('16');
        });

        it('should have default listSpacing of 0', () => {
            expect(service.settings.listSpacing).toBe('0');
        });
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
        });

        it('should toggle openLinkInNewTab from true to false', () => {
            service.settings.openLinkInNewTab = true;
            service.toggleOpenLinksInNewTab();
            expect(service.settings.openLinkInNewTab).toBe(false);
        });

        it('should save openLinkInNewTab to localStorage', () => {
            service.settings.openLinkInNewTab = false;
            service.toggleOpenLinksInNewTab();
            expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
        });
    });

    describe('setTheme', () => {
        it('should set the theme', () => {
            service.setTheme('night');
            expect(service.settings.theme).toBe('night');
        });

        it('should save theme to localStorage', () => {
            service.setTheme('night');
            expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
        });

        it('should set default theme', () => {
            service.setTheme('default');
            expect(service.settings.theme).toBe('default');
        });
    });

    describe('setFont', () => {
        it('should set the font size', () => {
            service.setFont('18');
            expect(service.settings.titleFontSize).toBe('18');
        });

        it('should save font size to localStorage', () => {
            service.setFont('20');
            expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
        });
    });

    describe('setSpacing', () => {
        it('should set the list spacing', () => {
            service.setSpacing('10');
            expect(service.settings.listSpacing).toBe('10');
        });

        it('should save list spacing to localStorage', () => {
            service.setSpacing('5');
            expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '5');
        });
    });

    describe('handleSystemPreferredColorSchemeChange', () => {
        it('should set theme to night when system prefers dark mode', () => {
            const event = new MediaQueryListEvent('change', { matches: true, media: '(prefers-color-scheme: dark)' });
            service.handleSystemPreferredColorSchemeChange(event);
            expect(service.settings.theme).toBe('night');
        });

        it('should set theme to default when system prefers light mode', () => {
            const event = new MediaQueryListEvent('change', { matches: false, media: '(prefers-color-scheme: dark)' });
            service.handleSystemPreferredColorSchemeChange(event);
            expect(service.settings.theme).toBe('default');
        });
    });
});
