import { mockMatchMedia, type MatchMediaMock } from '../../test/matchMedia';
import {
    DARK_SCHEME_QUERY,
    getSavedTheme,
    getSystemTheme,
    loadSettings,
    saveListSpacing,
    saveOpenLinkInNewTab,
    saveTheme,
    saveTitleFontSize,
    STORAGE_KEYS,
    THEMES,
} from './settings';

describe('settings', () => {
    let media: MatchMediaMock;

    beforeEach(() => {
        media = mockMatchMedia(false);
    });

    afterEach(() => {
        media.restore();
    });

    it('exposes the Angular theme values, storage keys and media query', () => {
        expect(THEMES).toEqual([
            { value: 'default', label: 'Default' },
            { value: 'night', label: 'Night' },
            { value: 'amoledblack', label: 'Black (AMOLED)' },
        ]);
        expect(STORAGE_KEYS).toEqual({
            openLinkInNewTab: 'openLinkInNewTab',
            theme: 'theme',
            titleFontSize: 'titleFontSize',
            listSpacing: 'listSpacing',
        });
        expect(DARK_SCHEME_QUERY).toBe('(prefers-color-scheme: dark)');
    });

    describe('getSystemTheme', () => {
        it('returns default for a light system scheme', () => {
            expect(getSystemTheme()).toBe('default');
            expect(media.matchMedia).toHaveBeenCalledWith(DARK_SCHEME_QUERY);
        });

        it('returns night for a dark system scheme', () => {
            media.setMatches(true);
            expect(getSystemTheme()).toBe('night');
        });

        it('returns default when matchMedia is unavailable', () => {
            media.restore();
            expect(getSystemTheme()).toBe('default');
        });
    });

    describe('getSavedTheme', () => {
        it('returns null when nothing is saved', () => {
            expect(getSavedTheme()).toBeNull();
        });

        it('returns a saved known theme', () => {
            localStorage.setItem('theme', 'amoledblack');
            expect(getSavedTheme()).toBe('amoledblack');
        });

        it('ignores unknown values', () => {
            localStorage.setItem('theme', 'sepia');
            expect(getSavedTheme()).toBeNull();
        });
    });

    describe('loadSettings', () => {
        it('uses the Angular defaults with an empty storage and light system scheme', () => {
            expect(loadSettings()).toEqual({
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            });
        });

        it('falls back to the night theme for a dark system scheme', () => {
            media.setMatches(true);
            expect(loadSettings().theme).toBe('night');
        });

        it('reads saved values', () => {
            localStorage.setItem('openLinkInNewTab', 'true');
            localStorage.setItem('theme', 'night');
            localStorage.setItem('titleFontSize', '20');
            localStorage.setItem('listSpacing', '10');
            expect(loadSettings()).toEqual({
                showSettings: false,
                openLinkInNewTab: true,
                theme: 'night',
                titleFontSize: '20',
                listSpacing: '10',
            });
        });

        it('prefers a saved theme over the system scheme', () => {
            media.setMatches(true);
            localStorage.setItem('theme', 'default');
            expect(loadSettings().theme).toBe('default');
        });

        it.each([
            ['false', false],
            ['not json', false],
            ['"true"', false],
        ])('parses openLinkInNewTab %s as %s', (raw, expected) => {
            localStorage.setItem('openLinkInNewTab', raw);
            expect(loadSettings().openLinkInNewTab).toBe(expected);
        });
    });

    describe('persistence', () => {
        it('serialises values exactly like the Angular service', () => {
            saveTheme('amoledblack');
            saveOpenLinkInNewTab(true);
            saveTitleFontSize('18');
            saveListSpacing('5');
            expect(localStorage.getItem('theme')).toBe('amoledblack');
            expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
            expect(localStorage.getItem('titleFontSize')).toBe('18');
            expect(localStorage.getItem('listSpacing')).toBe('5');

            saveOpenLinkInNewTab(false);
            expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
        });
    });
});
