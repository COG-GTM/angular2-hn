import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isTheme, type Settings } from '../types';

/** localStorage keys, identical to Angular's `SettingsService`. */
export const STORAGE_KEYS = {
    openLinkInNewTab: 'openLinkInNewTab',
    theme: 'theme',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
} as const;

export const DEFAULT_SETTINGS: Readonly<Settings> = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
};

export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readStorage(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorage(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Storage can be unavailable (private mode, quota); settings still work for this session.
    }
}

/** Angular: `JSON.parse(localStorage.getItem('openLinkInNewTab'))`; only a stored `true` counts. */
function readBoolean(key: string, fallback: boolean): boolean {
    const raw = readStorage(key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) === true;
    } catch {
        return fallback;
    }
}

function darkSchemeMedia(): MediaQueryList | null {
    return typeof window.matchMedia === 'function' ? window.matchMedia(DARK_SCHEME_QUERY) : null;
}

/** Angular `handleSystemPreferredColorSchemeChange`: dark → `night`, otherwise `default`. */
function systemTheme(): string {
    return darkSchemeMedia()?.matches ? 'night' : 'default';
}

/**
 * Port of Angular's `SettingsService` (`src/app/shared/services/settings.service.ts`): same localStorage keys,
 * defaults and methods. Theme parity: with no saved theme the system color scheme picks `default`/`night`
 * and is saved (Angular's `initTheme` dispatches a change event that calls `setTheme`); later system
 * color-scheme changes switch (and save) the theme.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
    const [showSettings, setShowSettings] = useState(DEFAULT_SETTINGS.showSettings);
    const [openLinkInNewTab, setOpenLinkInNewTab] = useState(() =>
        readBoolean(STORAGE_KEYS.openLinkInNewTab, DEFAULT_SETTINGS.openLinkInNewTab)
    );
    const [titleFontSize, setTitleFontSize] = useState(
        () => readStorage(STORAGE_KEYS.titleFontSize) || DEFAULT_SETTINGS.titleFontSize
    );
    const [listSpacing, setListSpacing] = useState(
        () => readStorage(STORAGE_KEYS.listSpacing) || DEFAULT_SETTINGS.listSpacing
    );
    const [theme, setThemeState] = useState(() => {
        const saved = readStorage(STORAGE_KEYS.theme);
        return isTheme(saved) ? saved : systemTheme();
    });

    const toggleSettings = useCallback(() => setShowSettings((shown) => !shown), []);
    const toggleOpenLinksInNewTab = useCallback(() => {
        setOpenLinkInNewTab((current) => {
            writeStorage(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(!current));
            return !current;
        });
    }, []);
    const setTheme = useCallback((next: string) => {
        if (!isTheme(next)) return;
        setThemeState(next);
        writeStorage(STORAGE_KEYS.theme, next);
    }, []);
    const setFont = useCallback((fontSize: string) => {
        setTitleFontSize(fontSize);
        writeStorage(STORAGE_KEYS.titleFontSize, fontSize);
    }, []);
    const setSpacing = useCallback((listSpace: string) => {
        setListSpacing(listSpace);
        writeStorage(STORAGE_KEYS.listSpacing, listSpace);
    }, []);

    // Angular initTheme(): no saved theme → the system-derived theme is saved on first visit.
    useEffect(() => {
        if (!isTheme(readStorage(STORAGE_KEYS.theme))) writeStorage(STORAGE_KEYS.theme, theme);
        // Mount only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Angular subscribeToSystemPreferredColorScheme(): a system color-scheme change switches the theme.
    useEffect(() => {
        const media = darkSchemeMedia();
        if (!media) return;
        const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings: { showSettings, openLinkInNewTab, theme, titleFontSize, listSpacing },
            toggleSettings,
            toggleOpenLinksInNewTab,
            setTheme,
            setFont,
            setSpacing,
        }),
        [
            showSettings,
            openLinkInNewTab,
            theme,
            titleFontSize,
            listSpacing,
            toggleSettings,
            toggleOpenLinksInNewTab,
            setTheme,
            setFont,
            setSpacing,
        ]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const value = useContext(SettingsContext);
    if (!value) throw new Error('useSettings must be used inside <SettingsProvider>');
    return value;
}
