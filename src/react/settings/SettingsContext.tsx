import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Settings } from '../models/settings';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function initialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings(current => ({ ...current, theme }));
    }, []);

    const setThemeRef = useRef(setTheme);
    setThemeRef.current = setTheme;

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => setThemeRef.current(event.matches ? 'night' : 'default');

        darkColorSchemeMedia.addEventListener('change', handleChange);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings(current => ({ ...current, theme: savedTheme }));
        } else {
            setThemeRef.current(darkColorSchemeMedia.matches ? 'night' : 'default');
        }

        return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
    }, []);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            toggleSettings: () => setSettings(current => ({ ...current, showSettings: !current.showSettings })),
            toggleOpenLinksInNewTab: () =>
                setSettings(current => {
                    const openLinkInNewTab = !current.openLinkInNewTab;
                    localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
                    return { ...current, openLinkInNewTab };
                }),
            setTheme,
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
