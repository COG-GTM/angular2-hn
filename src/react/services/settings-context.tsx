/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { Settings } from '../models/settings';

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
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ? localStorage.getItem('titleFontSize')! : '16',
        listSpacing: localStorage.getItem('listSpacing') ? localStorage.getItem('listSpacing')! : '0',
    };
}

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<Settings>(readInitialSettings);

    const setTheme = useCallback((theme: string) => {
        setSettings((s) => ({ ...s, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings((s) => ({ ...s, theme: savedTheme }));
        } else {
            setTheme(darkColorSchemeMedia.matches ? 'night' : 'default');
        }

        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
        };
    }, [setTheme]);

    const toggleSettings = useCallback(() => {
        setSettings((s) => ({ ...s, showSettings: !s.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((s) => {
            const openLinkInNewTab = !s.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...s, openLinkInNewTab };
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings((s) => ({ ...s, titleFontSize: fontSize }));
        localStorage.setItem('titleFontSize', fontSize);
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        setSettings((s) => ({ ...s, listSpacing: listSpace }));
        localStorage.setItem('listSpacing', listSpace);
    }, []);

    const value: SettingsContextValue = {
        settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
