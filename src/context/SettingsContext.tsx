import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { Settings } from '../models/settings';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function initialSettings(): Settings {
    const savedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: savedOpenLinkInNewTab ? (JSON.parse(savedOpenLinkInNewTab) as boolean) : false,
        theme: localStorage.getItem('theme') ?? 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const setTheme = useCallback((theme: string) => {
        setSettings((current) => ({ ...current, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        darkColorSchemeMedia.addEventListener('change', handleChange);

        // Only follow the system preference when no theme has been saved yet.
        if (!localStorage.getItem('theme')) {
            handleChange(darkColorSchemeMedia);
        }

        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleChange);
        };
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
                setSettings((current) => ({ ...current, titleFontSize }));
                localStorage.setItem('titleFontSize', titleFontSize);
            },
            setSpacing: (listSpacing: string) => {
                setSettings((current) => ({ ...current, listSpacing }));
                localStorage.setItem('listSpacing', listSpacing);
            },
        }),
        [settings, setTheme]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
