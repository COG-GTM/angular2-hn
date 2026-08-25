import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

import { Settings } from '../models';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function readInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches;

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: savedTheme ? savedTheme : prefersDark ? 'night' : 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(readInitialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    useEffect(() => {
        if (!localStorage.getItem('theme')) {
            setTheme(settings.theme);
        }
        // Persist the system-derived theme once, mirroring the original service's init.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
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

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
