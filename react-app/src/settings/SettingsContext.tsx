import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings, Theme } from '../models';
import { jsonCodec, stringCodec, useLocalStorage, type Codec } from './useLocalStorage';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const booleanCodec = jsonCodec<boolean>();
const themeCodec = stringCodec as Codec<Theme>;

function systemTheme(): Theme {
    return window.matchMedia?.(DARK_SCHEME_QUERY).matches ? 'night' : 'default';
}

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: Theme) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [showSettings, setShowSettings] = useState(false);
    const [openLinkInNewTab, setOpenLinkInNewTab] = useLocalStorage('openLinkInNewTab', false, booleanCodec);
    const [theme, setTheme] = useLocalStorage<Theme>('theme', systemTheme, themeCodec);
    const [titleFontSize, setFont] = useLocalStorage('titleFontSize', '16', stringCodec);
    const [listSpacing, setSpacing] = useLocalStorage('listSpacing', '0', stringCodec);

    // Without a saved theme the Angular service applied (and persisted) the system color scheme.
    useEffect(() => {
        if (!window.localStorage.getItem('theme')) {
            setTheme(systemTheme());
        }
    }, [setTheme]);

    // Follow later changes to the system color scheme, as the Angular service did.
    useEffect(() => {
        const media = window.matchMedia?.(DARK_SCHEME_QUERY);
        if (!media) {
            return;
        }
        const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [setTheme]);

    // Theme switching via a class on the document root; the reused _themes.scss keys off it.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.add(theme);
        return () => root.classList.remove(theme);
    }, [theme]);

    const toggleSettings = useCallback(() => setShowSettings((show) => !show), []);
    const toggleOpenLinksInNewTab = useCallback(
        () => setOpenLinkInNewTab(!openLinkInNewTab),
        [openLinkInNewTab, setOpenLinkInNewTab]
    );

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

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return ctx;
}
