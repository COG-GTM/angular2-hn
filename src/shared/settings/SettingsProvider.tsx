import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';

import { SettingsContext, type SettingsContextValue } from './settings-context';
import { readBoolean, readStorage, readString, STORAGE_KEYS, writeStorage } from './storage';
import { applyThemeClass, darkSchemeMedia, DEFAULT_SETTINGS, systemTheme } from './theme';

/**
 * Port of Angular's SettingsService (same localStorage keys and defaults). Theme parity: with nothing
 * saved, the theme comes from `prefers-color-scheme` AND is persisted on first visit; a later system
 * color-scheme change switches (and persists) the theme. The active theme class goes on `<html>`.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
    const [showSettings, setShowSettings] = useState(DEFAULT_SETTINGS.showSettings);
    const [openLinkInNewTab, setOpenLinkInNewTab] = useState(() =>
        readBoolean(STORAGE_KEYS.openLinkInNewTab, DEFAULT_SETTINGS.openLinkInNewTab)
    );
    const [titleFontSize, setTitleFontSize] = useState(() =>
        readString(STORAGE_KEYS.titleFontSize, DEFAULT_SETTINGS.titleFontSize)
    );
    const [listSpacing, setListSpacing] = useState(() =>
        readString(STORAGE_KEYS.listSpacing, DEFAULT_SETTINGS.listSpacing)
    );
    const [theme, setThemeState] = useState(() => readStorage(STORAGE_KEYS.theme) || systemTheme());

    const setTheme = useCallback((next: string) => {
        setThemeState(next);
        writeStorage(STORAGE_KEYS.theme, next);
    }, []);
    const setFont = useCallback((next: string) => {
        setTitleFontSize(next);
        writeStorage(STORAGE_KEYS.titleFontSize, next);
    }, []);
    const setSpacing = useCallback((next: string) => {
        setListSpacing(next);
        writeStorage(STORAGE_KEYS.listSpacing, next);
    }, []);
    const toggleOpenLinksInNewTab = useCallback(() => {
        setOpenLinkInNewTab((current) => {
            writeStorage(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(!current));
            return !current;
        });
    }, []);
    const toggleSettings = useCallback(() => setShowSettings((shown) => !shown), []);

    // Angular initTheme(): persist the system-derived theme on first visit (parity, intentional).
    useEffect(() => {
        if (!readStorage(STORAGE_KEYS.theme)) writeStorage(STORAGE_KEYS.theme, theme);
        // Mount only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Angular subscribeToSystemPreferredColorScheme(): live system changes always win.
    useEffect(() => {
        const media = darkSchemeMedia();
        if (!media) return;
        const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [setTheme]);

    useLayoutEffect(() => {
        applyThemeClass(theme);
    }, [theme]);

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
