import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Settings } from '../types/settings';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function readBoolean(key: string, fallback: boolean): boolean {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    try {
        return JSON.parse(stored) as boolean;
    } catch {
        return fallback;
    }
}

function readString(key: string, fallback: string): string {
    const stored = localStorage.getItem(key);
    return stored ?? fallback;
}

function getInitialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: readBoolean('openLinkInNewTab', false),
        theme: localStorage.getItem('theme') ?? 'default',
        titleFontSize: readString('titleFontSize', '16'),
        listSpacing: readString('listSpacing', '0'),
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => getInitialSettings());

    useEffect(() => {
        if (localStorage.getItem('theme')) {
            return;
        }
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const applySystemTheme = (matches: boolean) => {
            setSettings((s) => ({ ...s, theme: matches ? 'night' : 'default' }));
        };
        applySystemTheme(media.matches);
        const listener = (event: MediaQueryListEvent) => applySystemTheme(event.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((s) => ({ ...s, showSettings: !s.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((s) => {
            const next = !s.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
            return { ...s, openLinkInNewTab: next };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        setSettings((s) => {
            localStorage.setItem('theme', theme);
            return { ...s, theme };
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings((s) => {
            localStorage.setItem('titleFontSize', fontSize);
            return { ...s, titleFontSize: fontSize };
        });
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        setSettings((s) => {
            localStorage.setItem('listSpacing', listSpacing);
            return { ...s, listSpacing };
        });
    }, []);

    const value = useMemo<SettingsContextValue>(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing],
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return ctx;
}
