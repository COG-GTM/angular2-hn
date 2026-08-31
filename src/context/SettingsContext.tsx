import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Settings } from '../models/settings';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const darkColorSchemeQuery = '(prefers-color-scheme: dark)';

function initialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(darkColorSchemeQuery).matches;

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: savedTheme ? savedTheme : prefersDark ? 'night' : 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings(current => ({ ...current, theme }));
    }, []);

    useEffect(() => {
        const media = window.matchMedia(darkColorSchemeQuery);
        const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');

        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            setTheme,
            toggleSettings: () => setSettings(current => ({ ...current, showSettings: !current.showSettings })),
            toggleOpenLinksInNewTab: () =>
                setSettings(current => {
                    const openLinkInNewTab = !current.openLinkInNewTab;
                    localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
                    return { ...current, openLinkInNewTab };
                }),
            setFont: (titleFontSize: string) => {
                localStorage.setItem('titleFontSize', titleFontSize);
                setSettings(current => ({ ...current, titleFontSize }));
            },
            setSpacing: (listSpacing: string) => {
                localStorage.setItem('listSpacing', listSpacing);
                setSettings(current => ({ ...current, listSpacing }));
            },
        }),
        [settings, setTheme]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
