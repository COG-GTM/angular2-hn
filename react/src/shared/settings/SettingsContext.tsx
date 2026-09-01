import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Settings } from '../models';
import { readInitialSettings, resolveInitialTheme } from './settings-storage';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: PropsWithChildren) {
    const [settings, setSettings] = useState<Settings>(readInitialSettings);

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

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    const setFont = useCallback((fontSize: string) => {
        localStorage.setItem('titleFontSize', fontSize);
        setSettings((current) => ({ ...current, titleFontSize: fontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        setSettings((current) => ({ ...current, listSpacing }));
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const savedTheme = localStorage.getItem('theme');
        const handleColorSchemeChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        mediaQuery.addEventListener('change', handleColorSchemeChange);

        if (savedTheme !== null) {
            setSettings((current) => ({ ...current, theme: savedTheme }));
        } else {
            setTheme(resolveInitialTheme(null, mediaQuery.matches));
        }

        return () => {
            mediaQuery.removeEventListener('change', handleColorSchemeChange);
        };
    }, [setTheme]);

    const value = useMemo(
        () => ({
            settings,
            toggleSettings,
            toggleOpenLinksInNewTab,
            setTheme,
            setFont,
            setSpacing,
        }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
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
