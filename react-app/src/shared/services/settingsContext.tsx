import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Settings } from '../models/settings';

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function readStoredSettings(): Settings {
    const storedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: storedOpenLinkInNewTab ? (JSON.parse(storedOpenLinkInNewTab) as boolean) : false,
        theme: localStorage.getItem('theme') || 'default',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(readStoredSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings(current => ({ ...current, theme }));
    }, []);

    useEffect(() => {
        const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
        const onChange = (event: MediaQueryListEvent | MediaQueryList) =>
            setTheme(event.matches ? 'night' : 'default');

        if (!localStorage.getItem('theme')) {
            onChange(media);
        }
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
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
