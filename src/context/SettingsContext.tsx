import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Settings } from '../shared/models/settings';

interface SettingsContextValue extends Settings {
    setTheme: (theme: string) => void;
    toggleOpenLinksInNewTab: () => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
    toggleSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

function getInitialTheme(): string {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return darkColorSchemeMedia.matches ? 'night' : 'default';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [showSettings, setShowSettings] = useState(false);
    const [openLinkInNewTab, setOpenLinkInNewTab] = useState<boolean>(
        localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab') as string)
            : false
    );
    const [theme, setThemeState] = useState<string>(getInitialTheme);
    const [titleFontSize, setTitleFontSize] = useState<string>(localStorage.getItem('titleFontSize') || '16');
    const [listSpacing, setListSpacing] = useState<string>(localStorage.getItem('listSpacing') || '0');

    const setTheme = useCallback((newTheme: string) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
    }, []);

    useEffect(() => {
        const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
            setThemeState(event.matches ? 'night' : 'default');
        };
        darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
        };
    }, []);

    const toggleSettings = useCallback(() => setShowSettings((prev) => !prev), []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setOpenLinkInNewTab((prev) => {
            const next = !prev;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
            return next;
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setTitleFontSize(fontSize);
        localStorage.setItem('titleFontSize', fontSize);
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        setListSpacing(listSpace);
        localStorage.setItem('listSpacing', listSpace);
    }, []);

    const value = useMemo<SettingsContextValue>(
        () => ({
            showSettings,
            openLinkInNewTab,
            theme,
            titleFontSize,
            listSpacing,
            setTheme,
            toggleOpenLinksInNewTab,
            setFont,
            setSpacing,
            toggleSettings,
        }),
        [
            showSettings,
            openLinkInNewTab,
            theme,
            titleFontSize,
            listSpacing,
            setTheme,
            toggleOpenLinksInNewTab,
            setFont,
            setSpacing,
            toggleSettings,
        ]
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
