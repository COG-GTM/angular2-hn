import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { FeedName } from '../models';
import { SettingsContext, THEMES, type AppSettings, type SettingsContextValue, type Theme } from './settingsContext';
import { loadSettings, STORAGE_KEYS, systemTheme } from './settingsStorage';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function getDarkSchemeMedia(): MediaQueryList | null {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia(DARK_SCHEME_QUERY)
        : null;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(() =>
        loadSettings(window.localStorage, getDarkSchemeMedia()?.matches ?? false)
    );

    const setTheme = useCallback((theme: Theme) => {
        setSettings((prev) => ({ ...prev, theme }));
        window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    }, []);

    useEffect(() => {
        const media = getDarkSchemeMedia();
        if (!media) {
            return;
        }
        const onChange = (event: MediaQueryListEvent) => setTheme(systemTheme(event.matches));
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [setTheme]);

    useEffect(() => {
        const { classList } = document.body;
        classList.remove(...THEMES);
        classList.add(settings.theme);
    }, [settings.theme]);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const openLinkInNewTab = !prev.openLinkInNewTab;
            window.localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
            return { ...prev, openLinkInNewTab };
        });
    }, []);

    const setFont = useCallback((titleFontSize: string) => {
        setSettings((prev) => ({ ...prev, titleFontSize }));
        window.localStorage.setItem(STORAGE_KEYS.titleFontSize, titleFontSize);
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        setSettings((prev) => ({ ...prev, listSpacing }));
        window.localStorage.setItem(STORAGE_KEYS.listSpacing, listSpacing);
    }, []);

    const setDefaultFeed = useCallback((defaultFeed: FeedName) => {
        setSettings((prev) => ({ ...prev, defaultFeed }));
        window.localStorage.setItem(STORAGE_KEYS.defaultFeed, defaultFeed);
    }, []);

    const value = useMemo<SettingsContextValue>(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing, setDefaultFeed }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing, setDefaultFeed]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
