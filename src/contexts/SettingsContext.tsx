import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Settings } from '../models/settings';

interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => ({
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    }));

    const setTheme = useCallback((theme: string) => {
        setSettings((prev) => ({ ...prev, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings((prev) => ({ ...prev, theme: savedTheme }));
        } else {
            const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
            if (darkColorSchemeMedia.matches) {
                setTheme('night');
            } else {
                setTheme('default');
            }
        }
    }, [setTheme]);

    // Subscribe to system color scheme changes
    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (event: MediaQueryListEvent) => {
            const theme = event.matches ? 'night' : 'default';
            setTheme(theme);
        };
        darkColorSchemeMedia.addEventListener('change', handler);
        return () => {
            darkColorSchemeMedia.removeEventListener('change', handler);
        };
    }, [setTheme]);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const newVal = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
            return { ...prev, openLinkInNewTab: newVal };
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
        localStorage.setItem('titleFontSize', fontSize);
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
        localStorage.setItem('listSpacing', listSpace);
    }, []);

    return (
        <SettingsContext.Provider
            value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextType {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
