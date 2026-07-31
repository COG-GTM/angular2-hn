import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { Settings, Theme } from '../types';
import { SettingsContext } from './settingsContext';

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function readStoredTheme(): Theme | null {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'default' || storedTheme === 'night' || storedTheme === 'amoledblack' ? storedTheme : null;
}

function initialSettings(): Settings {
    const storedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');

    return {
        showSettings: false,
        openLinkInNewTab: storedOpenLinkInNewTab ? (JSON.parse(storedOpenLinkInNewTab) as boolean) : false,
        theme: readStoredTheme() ?? (window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches ? 'night' : 'default'),
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    // The system colour scheme only drives the theme while the user has not
    // picked one explicitly.
    useEffect(() => {
        const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
        const handleChange = (event: MediaQueryListEvent) => {
            if (readStoredTheme()) {
                return;
            }
            setSettings((current) => ({ ...current, theme: event.matches ? 'night' : 'default' }));
        };

        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((current) => {
            const openLinkInNewTab = !current.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...current, openLinkInNewTab };
        });
    }, []);

    const setTheme = useCallback((theme: Theme) => {
        localStorage.setItem('theme', theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    const setTitleFontSize = useCallback((titleFontSize: string) => {
        localStorage.setItem('titleFontSize', titleFontSize);
        setSettings((current) => ({ ...current, titleFontSize }));
    }, []);

    const setListSpacing = useCallback((listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        setSettings((current) => ({ ...current, listSpacing }));
    }, []);

    const value = useMemo(
        () => ({
            settings,
            toggleSettings,
            toggleOpenLinksInNewTab,
            setTheme,
            setTitleFontSize,
            setListSpacing,
        }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setTitleFontSize, setListSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
