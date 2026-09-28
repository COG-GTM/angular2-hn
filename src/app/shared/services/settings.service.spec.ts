import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    const storageKeys = ['theme', 'openLinkInNewTab', 'titleFontSize', 'listSpacing'];
    let savedStorage: { [key: string]: string | null };
    let colorSchemeMedia: EventTarget & { matches: boolean; media: string };

    const createService = () => TestBed.inject(SettingsService);

    const mockColorScheme = (prefersDark: boolean) => {
        colorSchemeMedia = Object.assign(new EventTarget(), {
            matches: prefersDark,
            media: '(prefers-color-scheme: dark)',
        });
        spyOn(window, 'matchMedia').and.returnValue((colorSchemeMedia as unknown) as MediaQueryList);
    };

    beforeEach(() => {
        savedStorage = {};
        storageKeys.forEach(key => {
            savedStorage[key] = localStorage.getItem(key);
            localStorage.removeItem(key);
        });
        TestBed.configureTestingModule({});
    });

    afterEach(() => {
        storageKeys.forEach(key => {
            if (savedStorage[key] === null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, savedStorage[key]);
            }
        });
    });

    describe('initial settings', () => {
        beforeEach(() => mockColorScheme(false));

        it('should use defaults when nothing is persisted', () => {
            const service = createService();

            expect(service.settings).toEqual({
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            });
        });

        it('should restore persisted preferences from localStorage', () => {
            localStorage.setItem('openLinkInNewTab', 'true');
            localStorage.setItem('titleFontSize', '20');
            localStorage.setItem('listSpacing', '8');
            localStorage.setItem('theme', 'amoledblack');

            const service = createService();

            expect(service.settings.openLinkInNewTab).toBe(true);
            expect(service.settings.titleFontSize).toBe('20');
            expect(service.settings.listSpacing).toBe('8');
            expect(service.settings.theme).toBe('amoledblack');
        });
    });

    describe('theme detection', () => {
        it('should pick the night theme when the system prefers a dark color scheme', () => {
            mockColorScheme(true);
            const service = createService();

            expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
            expect(service.settings.theme).toBe('night');
            expect(localStorage.getItem('theme')).toBe('night');
        });

        it('should pick the default theme when the system prefers a light color scheme', () => {
            mockColorScheme(false);
            const service = createService();

            expect(service.settings.theme).toBe('default');
        });

        it('should prefer a saved theme over the system color scheme', () => {
            localStorage.setItem('theme', 'amoledblack');
            mockColorScheme(true);
            const service = createService();

            expect(service.settings.theme).toBe('amoledblack');
        });

        it('should follow subsequent system color scheme changes', () => {
            mockColorScheme(false);
            const service = createService();

            colorSchemeMedia.dispatchEvent(new MediaQueryListEvent('change', { matches: true }));
            expect(service.settings.theme).toBe('night');

            colorSchemeMedia.dispatchEvent(new MediaQueryListEvent('change', { matches: false }));
            expect(service.settings.theme).toBe('default');
        });
    });

    describe('mutators', () => {
        let service: SettingsService;

        beforeEach(() => {
            mockColorScheme(false);
            service = createService();
        });

        it('toggleSettings should flip settings visibility', () => {
            service.toggleSettings();
            expect(service.settings.showSettings).toBe(true);

            service.toggleSettings();
            expect(service.settings.showSettings).toBe(false);
        });

        it('toggleOpenLinksInNewTab should flip and persist the preference', () => {
            service.toggleOpenLinksInNewTab();
            expect(service.settings.openLinkInNewTab).toBe(true);
            expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

            service.toggleOpenLinksInNewTab();
            expect(service.settings.openLinkInNewTab).toBe(false);
            expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
        });

        it('setTheme should update and persist the theme', () => {
            service.setTheme('amoledblack');

            expect(service.settings.theme).toBe('amoledblack');
            expect(localStorage.getItem('theme')).toBe('amoledblack');
        });

        it('setFont should update and persist the title font size', () => {
            service.setFont('22');

            expect(service.settings.titleFontSize).toBe('22');
            expect(localStorage.getItem('titleFontSize')).toBe('22');
        });

        it('setSpacing should update and persist the list spacing', () => {
            service.setSpacing('12');

            expect(service.settings.listSpacing).toBe('12');
            expect(localStorage.getItem('listSpacing')).toBe('12');
        });
    });
});
