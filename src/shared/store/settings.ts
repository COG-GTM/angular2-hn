import { create } from 'zustand';

import { THEMES, type Settings, type Theme } from '../models';

/**
 * Port of the Angular `SettingsService`: theme / font / spacing / link settings persisted
 * to `localStorage` (same keys as before) plus a `prefers-color-scheme` listener that
 * picks `night` or `default` until the user explicitly chooses a theme.
 */
export const SETTINGS_STORAGE_KEYS = {
    openLinkInNewTab: 'openLinkInNewTab',
    theme: 'theme',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
} as const;

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function readStorage(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorage(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // storage may be unavailable (private mode / quota); settings stay in memory
    }
}

function isTheme(value: string | null): value is Theme {
    return value !== null && (THEMES as readonly string[]).includes(value);
}

function getDarkSchemeMedia(): MediaQueryList | null {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia(DARK_SCHEME_QUERY)
        : null;
}

export function themeForColorScheme(prefersDark: boolean): Theme {
    return prefersDark ? 'night' : 'default';
}

export function loadInitialSettings(): Settings {
    const savedTheme = readStorage(SETTINGS_STORAGE_KEYS.theme);
    const savedOpenInNewTab = readStorage(SETTINGS_STORAGE_KEYS.openLinkInNewTab);
    return {
        showSettings: false,
        openLinkInNewTab: savedOpenInNewTab ? (JSON.parse(savedOpenInNewTab) as boolean) : false,
        theme: isTheme(savedTheme) ? savedTheme : themeForColorScheme(getDarkSchemeMedia()?.matches ?? false),
        titleFontSize: readStorage(SETTINGS_STORAGE_KEYS.titleFontSize) ?? '16',
        listSpacing: readStorage(SETTINGS_STORAGE_KEYS.listSpacing) ?? '0',
    };
}

export interface SettingsState extends Settings {
    /** True once the user picked a theme explicitly (or one was restored from storage). */
    themeChosen: boolean;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: Theme) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
    ...loadInitialSettings(),
    themeChosen: isTheme(readStorage(SETTINGS_STORAGE_KEYS.theme)),

    toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),

    toggleOpenLinksInNewTab: () => {
        const openLinkInNewTab = !get().openLinkInNewTab;
        writeStorage(SETTINGS_STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
        set({ openLinkInNewTab });
    },

    setTheme: (theme) => {
        writeStorage(SETTINGS_STORAGE_KEYS.theme, theme);
        set({ theme, themeChosen: true });
    },

    setFont: (titleFontSize) => {
        writeStorage(SETTINGS_STORAGE_KEYS.titleFontSize, titleFontSize);
        set({ titleFontSize });
    },

    setSpacing: (listSpacing) => {
        writeStorage(SETTINGS_STORAGE_KEYS.listSpacing, listSpacing);
        set({ listSpacing });
    },
}));

/**
 * Mirrors `SettingsService.subscribeToSystemPreferredColorScheme`: when the OS colour
 * scheme flips, switch between `night` and `default`. Unlike the Angular service this
 * only applies while the user has not picked a theme explicitly (`themeChosen`, tracked in
 * memory so a failed localStorage write doesn't lose the choice) and never persists the
 * automatic choice, so an explicit "amoledblack" survives a light/dark switch.
 * A theme chosen (or cleared) in another tab is mirrored via the `storage` event so every
 * tab shows the same theme. Returns an unsubscribe function.
 */
export function subscribeToSystemColorScheme(): () => void {
    const onStorage = (event: StorageEvent) => {
        if (event.key !== SETTINGS_STORAGE_KEYS.theme && event.key !== null) {
            return;
        }
        if (isTheme(event.newValue)) {
            useSettingsStore.setState({ theme: event.newValue, themeChosen: true });
        } else {
            useSettingsStore.setState({
                theme: themeForColorScheme(getDarkSchemeMedia()?.matches ?? false),
                themeChosen: false,
            });
        }
    };
    window.addEventListener('storage', onStorage);

    const media = getDarkSchemeMedia();
    if (!media) {
        return () => window.removeEventListener('storage', onStorage);
    }
    const handler = (event: MediaQueryListEvent) => {
        if (useSettingsStore.getState().themeChosen) {
            return;
        }
        useSettingsStore.setState({ theme: themeForColorScheme(event.matches) });
    };
    media.addEventListener('change', handler);
    return () => {
        media.removeEventListener('change', handler);
        window.removeEventListener('storage', onStorage);
    };
}
