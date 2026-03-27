import { createContext, useContext, useState, useEffect, useCallback, ReactNode, createElement } from 'react';
import { Settings } from '../types/Settings';

interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function getInitialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

function initTheme(settings: Settings, setSettings: React.Dispatch<React.SetStateAction<Settings>>) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setSettings((prev) => ({ ...prev, theme: savedTheme }));
    } else {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const theme = darkColorSchemeMedia.matches ? 'night' : 'default';
        setSettings((prev) => ({ ...prev, theme }));
    }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    useEffect(() => {
        initTheme(settings, setSettings);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (event: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                const theme = event.matches ? 'night' : 'default';
                setSettings((prev) => ({ ...prev, theme }));
            }
        };
        darkColorSchemeMedia.addEventListener('change', handler);
        return () => {
            darkColorSchemeMedia.removeEventListener('change', handler);
        };
    }, []);

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

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((prev) => ({ ...prev, theme }));
    }, []);

    const setFont = useCallback((fontSize: string) => {
        localStorage.setItem('titleFontSize', fontSize);
        setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        localStorage.setItem('listSpacing', listSpace);
        setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
    }, []);

    return createElement(
        SettingsContext.Provider,
        { value: { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } },
        children
    );
}

export function useSettings(): SettingsContextType {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
