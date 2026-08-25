import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { Settings } from '../models';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function getInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const titleFontSize = localStorage.getItem('titleFontSize');
    const listSpacing = localStorage.getItem('listSpacing');

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: 'default',
        titleFontSize: titleFontSize || '16',
        listSpacing: listSpacing || '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    const toggleSettings = useCallback(() => {
        setSettings((current) => ({
            ...current,
            showSettings: !current.showSettings,
        }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((current) => {
            const openLinkInNewTab = !current.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));

            return {
                ...current,
                openLinkInNewTab,
            };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        setSettings((current) => ({
            ...current,
            theme,
        }));
        localStorage.setItem('theme', theme);
    }, []);

    const setFont = useCallback((titleFontSize: string) => {
        setSettings((current) => ({
            ...current,
            titleFontSize,
        }));
        localStorage.setItem('titleFontSize', titleFontSize);
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        setSettings((current) => ({
            ...current,
            listSpacing,
        }));
        localStorage.setItem('listSpacing', listSpacing);
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
            setSettings((current) => ({
                ...current,
                theme: savedTheme,
            }));
        } else {
            setTheme(darkColorSchemeMedia.matches ? 'night' : 'default');
        }

        darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
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
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing],
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
