import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings } from '../models';
import {
    DARK_SCHEME_QUERY,
    getSavedTheme,
    getSystemTheme,
    loadSettings,
    saveListSpacing,
    saveOpenLinkInNewTab,
    saveTheme,
    saveTitleFontSize,
    type Theme,
} from './settings';
import { SettingsContext, type SettingsContextValue } from './settingsContext';

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(loadSettings);

    const setTheme = useCallback((theme: Theme) => {
        saveTheme(theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
    }, []);

    const { openLinkInNewTab } = settings;
    const toggleOpenLinksInNewTab = useCallback(() => {
        saveOpenLinkInNewTab(!openLinkInNewTab);
        setSettings((current) => ({ ...current, openLinkInNewTab: !openLinkInNewTab }));
    }, [openLinkInNewTab]);

    const setFont = useCallback((titleFontSize: string) => {
        saveTitleFontSize(titleFontSize);
        setSettings((current) => ({ ...current, titleFontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        saveListSpacing(listSpacing);
        setSettings((current) => ({ ...current, listSpacing }));
    }, []);

    useEffect(() => {
        if (getSavedTheme() === null) {
            setTheme(getSystemTheme());
        }
    }, [setTheme]);

    useEffect(() => {
        if (typeof window.matchMedia !== 'function') {
            return;
        }
        const darkScheme = window.matchMedia(DARK_SCHEME_QUERY);
        const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        darkScheme.addEventListener('change', handleChange);
        return () => darkScheme.removeEventListener('change', handleChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
