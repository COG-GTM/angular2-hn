import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings } from '../types';
import { SettingsContext } from './settingsContextDef';

function getInitialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

function getInitialTheme(): string {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'default';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => {
        const s = getInitialSettings();
        s.theme = getInitialTheme();
        return s;
    });
    const [userSetTheme, setUserSetTheme] = useState(() => localStorage.getItem('theme') !== null);

    const handleColorSchemeChange = useCallback((e: MediaQueryListEvent) => {
        if (userSetTheme) return;
        const theme = e.matches ? 'night' : 'default';
        setSettings(prev => ({ ...prev, theme }));
    }, [userSetTheme]);

    useEffect(() => {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        mql.addEventListener('change', handleColorSchemeChange);
        return () => mql.removeEventListener('change', handleColorSchemeChange);
    }, [handleColorSchemeChange]);

    const toggleSettings = useCallback(() => {
        setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings(prev => {
            const next = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
            return { ...prev, openLinkInNewTab: next };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        setSettings(prev => ({ ...prev, theme }));
        localStorage.setItem('theme', theme);
        setUserSetTheme(true);
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
        localStorage.setItem('titleFontSize', fontSize);
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        setSettings(prev => ({ ...prev, listSpacing: listSpace }));
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
