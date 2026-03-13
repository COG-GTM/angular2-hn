import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;
    let store: { [key: string]: string };

    beforeEach(() => {
        store = {};
        spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
            store[key] = value;
        });

        TestBed.configureTestingModule({
            providers: [SettingsService],
        });
        service = TestBed.inject(SettingsService);
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
        it('should toggle openLinkInNewTab and save to localStorage', () => {
            service.settings.openLinkInNewTab = false;
            service.toggleOpenLinksInNewTab();
            expect(service.settings.openLinkInNewTab).toBe(true);
            expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
        });

        it('should toggle back to false', () => {
            service.settings.openLinkInNewTab = true;
            service.toggleOpenLinksInNewTab();
            expect(service.settings.openLinkInNewTab).toBe(false);
            expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
        });
    });

    describe('setTheme', () => {
        it('should set theme and save to localStorage', () => {
            service.setTheme('night');
            expect(service.settings.theme).toBe('night');
            expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
        });

        it('should set amoledblack theme', () => {
            service.setTheme('amoledblack');
            expect(service.settings.theme).toBe('amoledblack');
            expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'amoledblack');
        });
    });

    describe('setFont', () => {
        it('should set font size and save to localStorage', () => {
            service.setFont('20');
            expect(service.settings.titleFontSize).toBe('20');
            expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
        });
    });

    describe('setSpacing', () => {
        it('should set list spacing and save to localStorage', () => {
            service.setSpacing('10');
            expect(service.settings.listSpacing).toBe('10');
            expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '10');
        });
    });

    describe('initTheme', () => {
        it('should use saved theme from localStorage when available', () => {
            store['theme'] = 'night';
            service.initTheme();
            expect(service.settings.theme).toBe('night');
        });

        it('should dispatch event when no saved theme', () => {
            // The initTheme was already called in the constructor.
            // We verify it works by calling it again with no stored theme.
            const dispatchSpy = spyOn(service.darkColorSchemeMedia, 'dispatchEvent');
            // Clear any stored theme
            store['theme'] = '';
            service.initTheme();
            expect(dispatchSpy).toHaveBeenCalled();
        });
    });

    describe('handleSystemPreferredColorSchemeChange', () => {
        it('should set night theme when matches is true', () => {
            const event = new MediaQueryListEvent('change', { matches: true, media: '(prefers-color-scheme: dark)' });
            service.handleSystemPreferredColorSchemeChange(event);
            expect(service.settings.theme).toBe('night');
        });

        it('should set default theme when matches is false', () => {
            const event = new MediaQueryListEvent('change', { matches: false, media: '(prefers-color-scheme: dark)' });
            service.handleSystemPreferredColorSchemeChange(event);
            expect(service.settings.theme).toBe('default');
        });
    });

    describe('subscribeToSystemPreferredColorScheme', () => {
        it('should add event listener to darkColorSchemeMedia', () => {
            spyOn(service.darkColorSchemeMedia, 'addEventListener');
            service.subscribeToSystemPreferredColorScheme();
            expect(service.darkColorSchemeMedia.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
        });
    });

    describe('unSubscribeToSystemPrefferedColorScheme', () => {
        it('should remove event listener from darkColorSchemeMedia', () => {
            spyOn(service.darkColorSchemeMedia, 'removeEventListener');
            service.unSubscribeToSystemPrefferedColorScheme();
            expect(service.darkColorSchemeMedia.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
        });
    });

    describe('ngOnDestroy', () => {
        it('should call unSubscribeToSystemPrefferedColorScheme', () => {
            spyOn(service, 'unSubscribeToSystemPrefferedColorScheme');
            service.ngOnDestroy();
            expect(service.unSubscribeToSystemPrefferedColorScheme).toHaveBeenCalled();
        });
    });
});

describe('SettingsService with localStorage values', () => {
    let service: SettingsService;

    beforeEach(() => {
        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            const stored: { [key: string]: string } = {
                'openLinkInNewTab': 'true',
                'titleFontSize': '24',
                'listSpacing': '10',
                'theme': 'night',
            };
            return stored[key] || null;
        });
        spyOn(localStorage, 'setItem');

        TestBed.configureTestingModule({
            providers: [SettingsService],
        });
        service = TestBed.inject(SettingsService);
    });

    it('should load openLinkInNewTab from localStorage', () => {
        expect(service.settings.openLinkInNewTab).toBe(true);
    });

    it('should load titleFontSize from localStorage', () => {
        expect(service.settings.titleFontSize).toBe('24');
    });

    it('should load listSpacing from localStorage', () => {
        expect(service.settings.listSpacing).toBe('10');
    });

    it('should load theme from localStorage via initTheme', () => {
        expect(service.settings.theme).toBe('night');
    });
});
