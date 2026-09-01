import { readInitialSettings, resolveInitialTheme } from './settings-storage';

describe('settings-storage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('reads default settings', () => {
        expect(readInitialSettings()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('resolves a saved theme before system preference', () => {
        expect(resolveInitialTheme('amoledblack', true)).toBe('amoledblack');
    });

    it('resolves system preference when there is no saved theme', () => {
        expect(resolveInitialTheme(null, true)).toBe('night');
        expect(resolveInitialTheme(null, false)).toBe('default');
    });
});
