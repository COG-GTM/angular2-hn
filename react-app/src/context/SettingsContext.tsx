import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type { Settings } from '../models';
import { SettingsContext } from './settingsContext';

function getInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const savedTheme = localStorage.getItem('theme');
    const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: savedTheme || (prefersDark ? 'night' : 'default'),
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((prev) => ({ ...prev, theme }));
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia(
            '(prefers-color-scheme: dark)'
        );

        const handleChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        darkColorSchemeMedia.addEventListener('change', handleChange);

        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleChange);
        };
    }, [setTheme]);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const openLinkInNewTab = !prev.openLinkInNewTab;
            localStorage.setItem(
                'openLinkInNewTab',
                JSON.stringify(openLinkInNewTab)
            );
            return { ...prev, openLinkInNewTab };
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        localStorage.setItem('titleFontSize', fontSize);
        setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        localStorage.setItem('listSpacing', listSpace);
        setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
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
