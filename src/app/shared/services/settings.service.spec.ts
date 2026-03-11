import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;
    let mockMatchMedia: any;

    beforeEach(() => {
        localStorage.clear();

        mockMatchMedia = {
            matches: false,
            media: '(prefers-color-scheme: dark)',
            addEventListener: jasmine.createSpy('addEventListener'),
            removeEventListener: jasmine.createSpy('removeEventListener'),
            dispatchEvent: jasmine.createSpy('dispatchEvent'),
        };
        spyOn(window, 'matchMedia').and.returnValue(mockMatchMedia);

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
        expect(service.settings.showSettings).toBe(false);
        expect(service.settings.openLinkInNewTab).toBe(false);
        expect(service.settings.titleFontSize).toBe('16');
        expect(service.settings.listSpacing).toBe('0');
    });

    it('should read openLinkInNewTab from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        const newService = new SettingsService();
        expect(newService.settings.openLinkInNewTab).toBe(true);
    });

    it('should read titleFontSize from localStorage', () => {
        localStorage.setItem('titleFontSize', '20');
        const newService = new SettingsService();
        expect(newService.settings.titleFontSize).toBe('20');
    });

    it('should read listSpacing from localStorage', () => {
        localStorage.setItem('listSpacing', '10');
        const newService = new SettingsService();
        expect(newService.settings.listSpacing).toBe('10');
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
        it('should toggle openLinkInNewTab and persist to localStorage', () => {
            service.settings.openLinkInNewTab = false;
            service.toggleOpenLinksInNewTab();
            expect(service.settings.openLinkInNewTab).toBe(true);
            expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        });

        it('should toggle back to false', () => {
            service.settings.openLinkInNewTab = true;
            service.toggleOpenLinksInNewTab();
            expect(service.settings.openLinkInNewTab).toBe(false);
            expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
        });
    });

    describe('setTheme', () => {
        it('should set theme and persist to localStorage', () => {
            service.setTheme('night');
            expect(service.settings.theme).toBe('night');
            expect(localStorage.getItem('theme')).toBe('night');
        });

        it('should set amoledblack theme', () => {
            service.setTheme('amoledblack');
            expect(service.settings.theme).toBe('amoledblack');
            expect(localStorage.getItem('theme')).toBe('amoledblack');
        });
    });

    describe('setFont', () => {
        it('should set font size and persist to localStorage', () => {
            service.setFont('20');
            expect(service.settings.titleFontSize).toBe('20');
            expect(localStorage.getItem('titleFontSize')).toBe('20');
        });
    });

    describe('setSpacing', () => {
        it('should set list spacing and persist to localStorage', () => {
            service.setSpacing('10');
            expect(service.settings.listSpacing).toBe('10');
            expect(localStorage.getItem('listSpacing')).toBe('10');
        });
    });

    describe('initTheme', () => {
        it('should use saved theme from localStorage', () => {
            localStorage.setItem('theme', 'night');
            service.initTheme();
            expect(service.settings.theme).toBe('night');
        });

        it('should dispatch event when no saved theme', () => {
            localStorage.removeItem('theme');
            service.initTheme();
            expect(mockMatchMedia.dispatchEvent).toHaveBeenCalled();
        });
    });

    describe('handleSystemPreferredColorSchemeChange', () => {
        it('should set night theme when dark mode matches', () => {
            const event = new MediaQueryListEvent('change', {
                matches: true,
                media: '(prefers-color-scheme: dark)',
            });
            service.handleSystemPreferredColorSchemeChange(event);
            expect(service.settings.theme).toBe('night');
        });

        it('should set default theme when dark mode does not match', () => {
            const event = new MediaQueryListEvent('change', {
                matches: false,
                media: '(prefers-color-scheme: dark)',
            });
            service.handleSystemPreferredColorSchemeChange(event);
            expect(service.settings.theme).toBe('default');
        });
    });

    describe('subscribeToSystemPreferredColorScheme', () => {
        it('should add event listener for color scheme changes', () => {
            mockMatchMedia.addEventListener.calls.reset();
            service.subscribeToSystemPreferredColorScheme();
            expect(mockMatchMedia.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
        });
    });

    describe('ngOnDestroy', () => {
        it('should remove event listener', () => {
            service.ngOnDestroy();
            expect(mockMatchMedia.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
        });
    });
});
