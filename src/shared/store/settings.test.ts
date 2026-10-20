import { SETTINGS_STORAGE_KEYS, loadInitialSettings, subscribeToSystemColorScheme, useSettingsStore } from './settings';

type Listener = (event: MediaQueryListEvent) => void;

function stubMatchMedia(matches: boolean) {
    const listeners = new Set<Listener>();
    const media = {
        matches,
        media: '(prefers-color-scheme: dark)',
        addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
        removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
    } as unknown as MediaQueryList;
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(media));
    return {
        fire(next: boolean) {
            listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
        },
        listeners,
    };
}

describe('settings store', () => {
    beforeEach(() => {
        localStorage.clear();
        stubMatchMedia(false);
        useSettingsStore.setState({ ...loadInitialSettings(), themeChosen: false });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('defaults match the Angular SettingsService', () => {
        expect(loadInitialSettings()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('uses the night theme when the OS prefers dark and nothing is saved', () => {
        stubMatchMedia(true);
        expect(loadInitialSettings().theme).toBe('night');
    });

    it('prefers a saved theme over the OS colour scheme', () => {
        stubMatchMedia(true);
        localStorage.setItem(SETTINGS_STORAGE_KEYS.theme, 'amoledblack');
        expect(loadInitialSettings().theme).toBe('amoledblack');
    });

    it('restores persisted values using the legacy localStorage keys', () => {
        localStorage.setItem(SETTINGS_STORAGE_KEYS.openLinkInNewTab, 'true');
        localStorage.setItem(SETTINGS_STORAGE_KEYS.titleFontSize, '20');
        localStorage.setItem(SETTINGS_STORAGE_KEYS.listSpacing, '8');

        expect(loadInitialSettings()).toMatchObject({ openLinkInNewTab: true, titleFontSize: '20', listSpacing: '8' });
    });

    it('persists every setter to localStorage', () => {
        const store = useSettingsStore.getState();
        store.setTheme('night');
        store.setFont('18');
        store.setSpacing('4');
        store.toggleOpenLinksInNewTab();
        store.toggleSettings();

        expect(useSettingsStore.getState()).toMatchObject({
            theme: 'night',
            titleFontSize: '18',
            listSpacing: '4',
            openLinkInNewTab: true,
            showSettings: true,
        });
        expect(localStorage.getItem(SETTINGS_STORAGE_KEYS.theme)).toBe('night');
        expect(localStorage.getItem(SETTINGS_STORAGE_KEYS.titleFontSize)).toBe('18');
        expect(localStorage.getItem(SETTINGS_STORAGE_KEYS.listSpacing)).toBe('4');
        expect(localStorage.getItem(SETTINGS_STORAGE_KEYS.openLinkInNewTab)).toBe('true');
    });

    it('follows prefers-color-scheme changes until unsubscribed', () => {
        const media = stubMatchMedia(false);
        const unsubscribe = subscribeToSystemColorScheme();

        media.fire(true);
        expect(useSettingsStore.getState().theme).toBe('night');

        media.fire(false);
        expect(useSettingsStore.getState().theme).toBe('default');
        expect(localStorage.getItem(SETTINGS_STORAGE_KEYS.theme)).toBeNull();

        unsubscribe();
        expect(media.listeners.size).toBe(0);
    });

    it('does not override an explicitly chosen theme on prefers-color-scheme changes', () => {
        const media = stubMatchMedia(false);
        subscribeToSystemColorScheme();
        useSettingsStore.getState().setTheme('amoledblack');

        media.fire(true);
        expect(useSettingsStore.getState().theme).toBe('amoledblack');

        media.fire(false);
        expect(useSettingsStore.getState().theme).toBe('amoledblack');
        expect(localStorage.getItem(SETTINGS_STORAGE_KEYS.theme)).toBe('amoledblack');
    });

    it('keeps an explicitly chosen theme even when localStorage writes fail', () => {
        const media = stubMatchMedia(false);
        const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('QuotaExceededError');
        });
        subscribeToSystemColorScheme();
        useSettingsStore.getState().setTheme('amoledblack');

        media.fire(true);
        expect(useSettingsStore.getState().theme).toBe('amoledblack');
        setItem.mockRestore();
    });
});
