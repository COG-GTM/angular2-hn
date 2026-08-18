import { useCallback, useEffect, useState, type ReactNode } from 'react';

import type { Settings } from '../types';
import { SettingsContext } from './settings-context';

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function initialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const prefersDark =
        !localStorage.getItem('theme') && window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches;

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? (JSON.parse(openLinkInNewTab) as boolean) : false,
        theme: localStorage.getItem('theme') ?? (prefersDark ? 'night' : 'default'),
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    useEffect(() => {
        const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
        const handleChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, [setTheme]);

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

    const setFont = useCallback((titleFontSize: string) => {
        localStorage.setItem('titleFontSize', titleFontSize);
        setSettings((current) => ({ ...current, titleFontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        setSettings((current) => ({ ...current, listSpacing }));
    }, []);

    return (
        <SettingsContext.Provider
            value={{
                settings,
                toggleSettings,
                toggleOpenLinksInNewTab,
                setTheme,
                setFont,
                setSpacing,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}
