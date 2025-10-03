import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_SETTINGS } from '../types/settings';
import type { Settings, Theme } from '../types/settings';

interface SettingsContextType {
    settings: Settings;
    setTheme: (theme: Theme) => void;
    setFontSize: (fontSize: number) => void;
    setListSpacing: (spacing: number) => void;
    toggleSettings: () => void;
    isSettingsOpen: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'angular2-hn-settings';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            } catch {
                return DEFAULT_SETTINGS;
            }
        }

        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        if (darkColorSchemeMedia.matches) {
            return { ...DEFAULT_SETTINGS, theme: 'night' };
        }

        return DEFAULT_SETTINGS;
    });

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        document.body.className = settings.theme;
    }, [settings]);

    const setTheme = (theme: Theme) => {
        setSettings((prev) => ({ ...prev, theme }));
    };

    const setFontSize = (fontSize: number) => {
        setSettings((prev) => ({ ...prev, fontSize }));
    };

    const setListSpacing = (spacing: number) => {
        setSettings((prev) => ({ ...prev, listSpacing: spacing }));
    };

    const toggleSettings = () => {
        setIsSettingsOpen((prev) => !prev);
    };

    return (
        <SettingsContext.Provider
            value={{
                settings,
                setTheme,
                setFontSize,
                setListSpacing,
                toggleSettings,
                isSettingsOpen,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
