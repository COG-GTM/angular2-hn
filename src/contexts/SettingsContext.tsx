import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: string;
    titleFontSize: string;
    listSpacing: string;
}

interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const defaultSettings: Settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
};

function getInitialSettings(): Settings {
    if (typeof window === 'undefined') {
        return defaultSettings;
    }

    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const titleFontSize = localStorage.getItem('titleFontSize');
    const listSpacing = localStorage.getItem('listSpacing');
    const theme = localStorage.getItem('theme');

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: theme || 'default',
        titleFontSize: titleFontSize || '16',
        listSpacing: listSpacing || '0',
    };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    const handleSystemPreferredColorSchemeChange = useCallback((event: MediaQueryListEvent) => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            const newTheme = event.matches ? 'night' : 'default';
            setSettings((prev) => ({ ...prev, theme: newTheme }));
        }
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            const initialTheme = darkColorSchemeMedia.matches ? 'night' : 'default';
            setSettings((prev) => ({ ...prev, theme: initialTheme }));
        }

        darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
        };
    }, [handleSystemPreferredColorSchemeChange]);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const newValue = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(newValue));
            return { ...prev, openLinkInNewTab: newValue };
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

    const value: SettingsContextType = {
        settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextType {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
