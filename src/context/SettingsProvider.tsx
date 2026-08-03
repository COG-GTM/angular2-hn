import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Settings } from '../models';
import { SettingsContext, type SettingsContextValue } from './settingsContext';

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function readStoredSettings(): Settings {
    const storedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');

    return {
        showSettings: false,
        openLinkInNewTab: storedOpenLinkInNewTab ? JSON.parse(storedOpenLinkInNewTab) : false,
        theme: localStorage.getItem('theme') ?? 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(readStoredSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia(DARK_COLOR_SCHEME_QUERY);

        if (!localStorage.getItem('theme')) {
            setTheme(darkColorSchemeMedia.matches ? 'night' : 'default');
        }

        const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        darkColorSchemeMedia.addEventListener('change', handleChange);
        return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            setTheme,
            toggleSettings: () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
            toggleOpenLinksInNewTab: () =>
                setSettings((current) => {
                    const openLinkInNewTab = !current.openLinkInNewTab;
                    localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
                    return { ...current, openLinkInNewTab };
                }),
            setFont: (titleFontSize: string) => {
                localStorage.setItem('titleFontSize', titleFontSize);
                setSettings((current) => ({ ...current, titleFontSize }));
            },
            setSpacing: (listSpacing: string) => {
                localStorage.setItem('listSpacing', listSpacing);
                setSettings((current) => ({ ...current, listSpacing }));
            },
        }),
        [settings, setTheme]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
