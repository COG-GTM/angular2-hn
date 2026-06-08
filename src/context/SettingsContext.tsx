import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Settings } from '../types/settings';

interface SettingsContextValue extends Settings {
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function getInitialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: localStorage.getItem('theme') ?? '',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    const updateSettings = useCallback((update: Partial<Settings>) => {
        setSettings((prev) => ({ ...prev, ...update }));
    }, []);

    useEffect(() => {
        if (settings.theme !== '') return;

        const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const initial = darkQuery.matches ? 'night' : 'default';
        updateSettings({ theme: initial });

        const handler = (e: MediaQueryListEvent) => {
            const savedTheme = localStorage.getItem('theme');
            if (!savedTheme) {
                updateSettings({ theme: e.matches ? 'night' : 'default' });
            }
        };
        darkQuery.addEventListener('change', handler);
        return () => darkQuery.removeEventListener('change', handler);
    }, [settings.theme, updateSettings]);

    const toggleSettings = useCallback(() => {
        updateSettings({ showSettings: !settings.showSettings });
    }, [settings.showSettings, updateSettings]);

    const toggleOpenLinksInNewTab = useCallback(() => {
        const newVal = !settings.openLinkInNewTab;
        localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
        updateSettings({ openLinkInNewTab: newVal });
    }, [settings.openLinkInNewTab, updateSettings]);

    const setTheme = useCallback(
        (theme: string) => {
            localStorage.setItem('theme', theme);
            updateSettings({ theme });
        },
        [updateSettings]
    );

    const setFont = useCallback(
        (fontSize: string) => {
            localStorage.setItem('titleFontSize', fontSize);
            updateSettings({ titleFontSize: fontSize });
        },
        [updateSettings]
    );

    const setSpacing = useCallback(
        (listSpace: string) => {
            localStorage.setItem('listSpacing', listSpace);
            updateSettings({ listSpacing: listSpace });
        },
        [updateSettings]
    );

    const value: SettingsContextValue = {
        ...settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return ctx;
}
