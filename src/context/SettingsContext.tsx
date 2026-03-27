import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings } from '../types/settings';

interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => ({
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: localStorage.getItem('theme') ?? 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    }));

    const setTheme = useCallback((theme: string) => {
        setSettings((prev) => ({ ...prev, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    // If no saved theme, detect system preference
    useEffect(() => {
        if (!localStorage.getItem('theme')) {
            const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
            setTheme(darkMedia.matches ? 'night' : 'default');
        }
    }, [setTheme]);

    // Listen for system color scheme changes
    useEffect(() => {
        const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };
        darkMedia.addEventListener('change', handler);
        return () => darkMedia.removeEventListener('change', handler);
    }, [setTheme]);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const next = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
            return { ...prev, openLinkInNewTab: next };
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
