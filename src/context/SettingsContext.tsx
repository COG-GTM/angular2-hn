import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Settings } from '../models/settings';

export interface SettingsContextValue {
    settings: Settings;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
    toggleOpenLinksInNewTab: () => void;
    toggleSettings: () => void;
}

export const darkColorSchemeQuery = '(prefers-color-scheme: dark)';

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(readInitialSettings);

    const setTheme = useCallback((theme: string) => {
        setSettings((current) => ({ ...current, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings((current) => ({ ...current, titleFontSize: fontSize }));
        localStorage.setItem('titleFontSize', fontSize);
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        setSettings((current) => ({ ...current, listSpacing }));
        localStorage.setItem('listSpacing', listSpacing);
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((current) => {
            const openLinkInNewTab = !current.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...current, openLinkInNewTab };
        });
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia(darkColorSchemeQuery);
        const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings((current) => ({ ...current, theme: savedTheme }));
        } else {
            setTheme(darkColorSchemeMedia.matches ? 'night' : 'default');
        }

        return () => darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({ settings, setTheme, setFont, setSpacing, toggleOpenLinksInNewTab, toggleSettings }),
        [settings, setTheme, setFont, setSpacing, toggleOpenLinksInNewTab, toggleSettings]
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
