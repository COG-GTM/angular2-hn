import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Settings } from '../models/Settings';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function loadInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab')
        ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
        : false;
    const titleFontSize = localStorage.getItem('titleFontSize') ?? '16';
    const listSpacing = localStorage.getItem('listSpacing') ?? '0';
    const savedTheme = localStorage.getItem('theme');

    let theme = 'default';
    if (savedTheme) {
        theme = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'night';
    }

    return {
        showSettings: false,
        openLinkInNewTab,
        theme,
        titleFontSize,
        listSpacing,
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(loadInitialSettings);

    useEffect(() => {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            const hasSavedTheme = localStorage.getItem('theme') !== null;
            if (!hasSavedTheme) {
                setSettings((prev) => ({ ...prev, theme: e.matches ? 'night' : 'default' }));
            }
        };
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

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

    const setSpacing = useCallback((listSpacing: string) => {
        setSettings((prev) => {
            localStorage.setItem('listSpacing', listSpacing);
            return { ...prev, listSpacing };
        });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
    return ctx;
}
