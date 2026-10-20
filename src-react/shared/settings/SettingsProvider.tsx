import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';

import { SettingsContext, type SettingsContextValue } from './settings-context';
import { applyThemeClass, darkSchemeMedia, DEFAULT_SETTINGS, systemTheme } from './theme';
import { booleanCodec, readStorage, STORAGE_KEYS, stringCodec, useLocalStorage, writeStorage } from './storage';

/**
 * Port of Angular's SettingsService. Same localStorage keys/defaults. Theme parity with Angular:
 * with nothing saved, the initial theme comes from `prefers-color-scheme` AND is persisted; a later
 * system color-scheme change always switches (and persists) the theme. The active theme class is
 * applied to `document.documentElement`.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
    const [showSettings, setShowSettings] = useState(false);
    const [openLinkInNewTab, setOpenLinkInNewTab] = useLocalStorage(
        STORAGE_KEYS.openLinkInNewTab,
        DEFAULT_SETTINGS.openLinkInNewTab,
        booleanCodec
    );
    const [titleFontSize, setFont] = useLocalStorage(
        STORAGE_KEYS.titleFontSize,
        DEFAULT_SETTINGS.titleFontSize,
        stringCodec
    );
    const [listSpacing, setSpacing] = useLocalStorage(
        STORAGE_KEYS.listSpacing,
        DEFAULT_SETTINGS.listSpacing,
        stringCodec
    );
    const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.theme, systemTheme, stringCodec);

    useEffect(() => {
        if (!readStorage(STORAGE_KEYS.theme)) writeStorage(STORAGE_KEYS.theme, theme);
        // Only on mount: persist the system-derived theme like Angular's initTheme().
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const toggleSettings = useCallback(() => setShowSettings((shown) => !shown), []);
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
