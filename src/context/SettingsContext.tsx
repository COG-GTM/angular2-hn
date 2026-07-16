import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Settings } from '../types/settings';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function readInitialSettings(): Settings {
    const savedTheme = localStorage.getItem('theme');
    let theme: string;
    if (savedTheme) {
        theme = savedTheme;
    } else {
        const prefersDark = window.matchMedia(DARK_SCHEME_QUERY).matches;
        theme = prefersDark ? 'night' : 'default';
        localStorage.setItem('theme', theme);
    }

    const storedOpenLinks = localStorage.getItem('openLinkInNewTab');

    return {
        showSettings: false,
        openLinkInNewTab: storedOpenLinks ? JSON.parse(storedOpenLinks) : false,
        theme,
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(readInitialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((prev) => ({ ...prev, theme }));
    }, []);

    useEffect(() => {
        const media = window.matchMedia(DARK_SCHEME_QUERY);
        const handler = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    }, [setTheme]);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const openLinkInNewTab = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
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

    const value = useMemo<SettingsContextValue>(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
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
