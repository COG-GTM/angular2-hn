import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { Settings } from '../models/settings';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export const SettingsContext = createContext<SettingsContextValue | null>(null);

function readStoredSettings(): Settings {
    const storedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const storedTheme = localStorage.getItem('theme');

    return {
        showSettings: false,
        openLinkInNewTab: storedOpenLinkInNewTab ? JSON.parse(storedOpenLinkInNewTab) : false,
        theme: storedTheme ? storedTheme : 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(readStoredSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia(DARK_COLOR_SCHEME_QUERY);

        const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        // Only follow the system preference until the user picks a theme explicitly.
        if (!localStorage.getItem('theme')) {
            handleChange(darkColorSchemeMedia);
        }

        darkColorSchemeMedia.addEventListener('change', handleChange);

        return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(() => {
        return {
            settings,
            setTheme,
            toggleSettings() {
                setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
            },
            toggleOpenLinksInNewTab() {
                setSettings((current) => {
                    const openLinkInNewTab = !current.openLinkInNewTab;
                    localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
                    return { ...current, openLinkInNewTab };
                });
            },
            setFont(titleFontSize: string) {
                localStorage.setItem('titleFontSize', titleFontSize);
                setSettings((current) => ({ ...current, titleFontSize }));
            },
            setSpacing(listSpacing: string) {
                localStorage.setItem('listSpacing', listSpacing);
                setSettings((current) => ({ ...current, listSpacing }));
            },
        };
    }, [settings, setTheme]);

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);

    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }

    return context;
}
