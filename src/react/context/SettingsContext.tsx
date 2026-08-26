import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Settings } from '../models/settings';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function getStorage(): Storage | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function getDarkColorSchemeMedia(): MediaQueryList | null {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return null;
    }

    try {
        return window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
        return null;
    }
}

function getStoredValue(key: string): string | null {
    const storage = getStorage();

    try {
        return storage?.getItem(key) ?? null;
    } catch {
        return null;
    }
}

function getInitialSettings(): Settings {
    const darkColorSchemeMedia = getDarkColorSchemeMedia();
    const storedOpenLinkInNewTab = getStoredValue('openLinkInNewTab');
    let openLinkInNewTab = false;

    if (storedOpenLinkInNewTab) {
        try {
            openLinkInNewTab = JSON.parse(storedOpenLinkInNewTab);
        } catch {
            openLinkInNewTab = false;
        }
    }

    return {
        showSettings: false,
        openLinkInNewTab,
        theme: getStoredValue('theme') || (darkColorSchemeMedia?.matches ? 'night' : 'default'),
        titleFontSize: getStoredValue('titleFontSize') || '16',
        listSpacing: getStoredValue('listSpacing') || '0',
    };
}

function setStoredValue(key: string, value: string): void {
    const storage = getStorage();

    try {
        storage?.setItem(key, value);
    } catch {
        return;
    }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    const toggleSettings = useCallback(() => {
        setSettings(currentSettings => ({
            ...currentSettings,
            showSettings: !currentSettings.showSettings,
        }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings(currentSettings => {
            const openLinkInNewTab = !currentSettings.openLinkInNewTab;
            setStoredValue('openLinkInNewTab', JSON.stringify(openLinkInNewTab));

            return {
                ...currentSettings,
                openLinkInNewTab,
            };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        setStoredValue('theme', theme);
        setSettings(currentSettings => ({
            ...currentSettings,
            theme,
        }));
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setStoredValue('titleFontSize', fontSize);
        setSettings(currentSettings => ({
            ...currentSettings,
            titleFontSize: fontSize,
        }));
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        setStoredValue('listSpacing', listSpace);
        setSettings(currentSettings => ({
            ...currentSettings,
            listSpacing: listSpace,
        }));
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = getDarkColorSchemeMedia();

        if (!darkColorSchemeMedia) {
            return undefined;
        }

        const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        if (typeof darkColorSchemeMedia.addEventListener === 'function') {
            darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
        } else {
            darkColorSchemeMedia.addListener(handleSystemPreferredColorSchemeChange);
        }

        return () => {
            if (typeof darkColorSchemeMedia.removeEventListener === 'function') {
                darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
            } else {
                darkColorSchemeMedia.removeListener(handleSystemPreferredColorSchemeChange);
            }
        };
    }, [setTheme]);

    const value = useMemo(
        () => ({
            settings,
            toggleSettings,
            toggleOpenLinksInNewTab,
            setTheme,
            setFont,
            setSpacing,
        }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
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
