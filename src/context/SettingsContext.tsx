import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Settings } from '../types/settings';

interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>({
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'default'),
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    });

    const settingsRef = useRef(settings);
    settingsRef.current = settings;

    const setTheme = useCallback((theme: string) => {
        setSettings((prev) => ({ ...prev, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    // Listen to prefers-color-scheme: dark
    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (event: MediaQueryListEvent) => {
            const theme = event.matches ? 'night' : 'default';
            setTheme(theme);
        };

        // Init theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings((prev) => ({ ...prev, theme: savedTheme }));
        } else {
            // Dispatch initial check
            const theme = darkColorSchemeMedia.matches ? 'night' : 'default';
            setTheme(theme);
        }

        darkColorSchemeMedia.addEventListener('change', handleChange);
        return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
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

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
}
