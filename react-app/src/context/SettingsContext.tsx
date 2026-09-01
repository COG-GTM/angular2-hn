import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings, Theme } from '../models/settings';

export const STORAGE_KEYS = {
    theme: 'theme',
    openLinkInNewTab: 'openLinkInNewTab',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
} as const;

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: Theme) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

function readStored(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStored(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        /* storage unavailable (private mode) - settings stay in memory */
    }
}

const THEMES: readonly Theme[] = ['default', 'night', 'amoledblack'];

function storedTheme(): Theme | null {
    const theme = readStored(STORAGE_KEYS.theme);
    return THEMES.includes(theme as Theme) ? (theme as Theme) : null;
}

function storedNumber(key: string, fallback: string): string {
    const value = readStored(key);
    return value !== null && /^\d{1,3}$/.test(value) ? value : fallback;
}

function initialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: readStored(STORAGE_KEYS.openLinkInNewTab) === 'true',
        theme: storedTheme() ?? 'default',
        titleFontSize: storedNumber(STORAGE_KEYS.titleFontSize, '16'),
        listSpacing: storedNumber(STORAGE_KEYS.listSpacing, '0'),
    };
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const setTheme = useCallback((theme: Theme) => {
        writeStored(STORAGE_KEYS.theme, theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    // Follow the system colour scheme as long as the user has not picked a theme explicitly.
    useEffect(() => {
        if (typeof window.matchMedia !== 'function') {
            return;
        }
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (event: MediaQueryListEvent | MediaQueryList) => {
            if (storedTheme()) {
                return;
            }
            setSettings((current) => ({ ...current, theme: event.matches ? 'night' : 'default' }));
        };

        onChange(media);

        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            toggleSettings: () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
            toggleOpenLinksInNewTab: () =>
                setSettings((current) => {
                    const openLinkInNewTab = !current.openLinkInNewTab;
                    writeStored(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
                    return { ...current, openLinkInNewTab };
                }),
            setTheme,
            setFont: (titleFontSize: string) => {
                writeStored(STORAGE_KEYS.titleFontSize, titleFontSize);
                setSettings((current) => ({ ...current, titleFontSize }));
            },
            setSpacing: (listSpacing: string) => {
                writeStored(STORAGE_KEYS.listSpacing, listSpacing);
                setSettings((current) => ({ ...current, listSpacing }));
            },
        }),
        [settings, setTheme]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
