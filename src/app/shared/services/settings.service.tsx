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

const SettingsContext = createContext<SettingsContextType | null>(null);

function getInitialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

function initTheme(): string {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (darkColorSchemeMedia.matches) {
        return 'night';
    }
    return 'default';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => {
        const initial = getInitialSettings();
        initial.theme = initTheme();
        return initial;
    });

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (event: MediaQueryListEvent) => {
            const theme = event.matches ? 'night' : 'default';
            setSettings((prev) => {
                localStorage.setItem('theme', theme);
                return { ...prev, theme };
            });
        };
        darkColorSchemeMedia.addEventListener('change', handler);
        return () => {
            darkColorSchemeMedia.removeEventListener('change', handler);
        };
    }, []);

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

    const setTheme = useCallback((theme: string) => {
        setSettings((prev) => {
            localStorage.setItem('theme', theme);
            return { ...prev, theme };
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings((prev) => {
            localStorage.setItem('titleFontSize', fontSize);
            return { ...prev, titleFontSize: fontSize };
        });
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        setSettings((prev) => {
            localStorage.setItem('listSpacing', listSpace);
            return { ...prev, listSpacing: listSpace };
        });
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
