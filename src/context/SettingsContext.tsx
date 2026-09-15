import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Settings } from '../models';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings(): void;
    toggleOpenLinksInNewTab(): void;
    setTheme(theme: string): void;
    setFont(fontSize: string): void;
    setSpacing(listSpace: string): void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function getInitialSettings(): Settings {
    const savedOpenLinksInNewTab = localStorage.getItem('openLinkInNewTab');
    const savedTheme = localStorage.getItem('theme');
    const theme =
        savedTheme ??
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'default');

    if (savedTheme === null) {
        localStorage.setItem('theme', theme);
    }

    return {
        showSettings: false,
        openLinkInNewTab: savedOpenLinksInNewTab ? JSON.parse(savedOpenLinksInNewTab) : false,
        theme,
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: PropsWithChildren) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    const toggleSettings = useCallback(() => {
        setSettings((currentSettings) => ({
            ...currentSettings,
            showSettings: !currentSettings.showSettings,
        }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((currentSettings) => {
            const openLinkInNewTab = !currentSettings.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));

            return {
                ...currentSettings,
                openLinkInNewTab,
            };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((currentSettings) => ({ ...currentSettings, theme }));
    }, []);

    const setFont = useCallback((fontSize: string) => {
        localStorage.setItem('titleFontSize', fontSize);
        setSettings((currentSettings) => ({ ...currentSettings, titleFontSize: fontSize }));
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        localStorage.setItem('listSpacing', listSpace);
        setSettings((currentSettings) => ({ ...currentSettings, listSpacing: listSpace }));
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
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
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing],
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
