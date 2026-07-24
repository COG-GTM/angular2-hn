import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type { Settings } from '../models/settings';
import { SettingsContext } from './useSettings';

function getInitialTheme(): string {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'default';
}

function getInitialSettings(): Settings {
    const storedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: storedOpenLinkInNewTab ? JSON.parse(storedOpenLinkInNewTab) : false,
        theme: getInitialTheme(),
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const openLinkInNewTab = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...prev, openLinkInNewTab };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((prev) => ({ ...prev, theme }));
    }, []);

    const setFont = useCallback((fontSize: string) => {
        localStorage.setItem('titleFontSize', fontSize);
        setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        setSettings((prev) => ({ ...prev, listSpacing }));
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };
        darkColorSchemeMedia.addEventListener('change', handleChange);
        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleChange);
        };
    }, [setTheme]);

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
