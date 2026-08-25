import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Settings } from '../models/settings';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function initialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab') as string)
            : false,
        theme: localStorage.getItem('theme') || 'default',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

export function SettingsProvider({ children }: PropsWithChildren) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
            setSettings((currentSettings) => {
                const theme = event.matches ? 'night' : 'default';
                localStorage.setItem('theme', theme);
                return { ...currentSettings, theme };
            });
        };

        darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
        if (!localStorage.getItem('theme')) {
            handleSystemPreferredColorSchemeChange({
                matches: darkColorSchemeMedia.matches,
            } as MediaQueryListEvent);
        }

        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
        };
    }, []);

    const toggleSettings = () => {
        setSettings((currentSettings) => ({
            ...currentSettings,
            showSettings: !currentSettings.showSettings,
        }));
    };

    const toggleOpenLinksInNewTab = () => {
        setSettings((currentSettings) => {
            const openLinkInNewTab = !currentSettings.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...currentSettings, openLinkInNewTab };
        });
    };

    const setTheme = (theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((currentSettings) => ({ ...currentSettings, theme }));
    };

    const setFont = (titleFontSize: string) => {
        localStorage.setItem('titleFontSize', titleFontSize);
        setSettings((currentSettings) => ({ ...currentSettings, titleFontSize }));
    };

    const setSpacing = (listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        setSettings((currentSettings) => ({ ...currentSettings, listSpacing }));
    };

    return (
        <SettingsContext.Provider
            value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
