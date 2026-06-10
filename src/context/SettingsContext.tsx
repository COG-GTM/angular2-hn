import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import type { Settings } from '../types';

interface SettingsContextValue extends Settings {
    setTheme: (theme: string) => void;
    setOpenLinkInNewTab: (value: boolean) => void;
    toggleOpenLinksInNewTab: () => void;
    setTitleFontSize: (size: string) => void;
    setListSpacing: (spacing: string) => void;
    toggleSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function readInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const titleFontSize = localStorage.getItem('titleFontSize');
    const listSpacing = localStorage.getItem('listSpacing');

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: 'default',
        titleFontSize: titleFontSize ? titleFontSize : '16',
        listSpacing: listSpacing ? listSpacing : '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(readInitialSettings);

    const setTheme = useCallback((theme: string) => {
        setSettings((prev) => ({ ...prev, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    // Initialize theme from localStorage, otherwise follow the system color scheme.
    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings((prev) => ({ ...prev, theme: savedTheme }));
        } else {
            handleChange(darkColorSchemeMedia);
        }

        darkColorSchemeMedia.addEventListener('change', handleChange);
        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleChange);
        };
    }, [setTheme]);

    const setOpenLinkInNewTab = useCallback((value: boolean) => {
        setSettings((prev) => ({ ...prev, openLinkInNewTab: value }));
        localStorage.setItem('openLinkInNewTab', JSON.stringify(value));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const next = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
            return { ...prev, openLinkInNewTab: next };
        });
    }, []);

    const setTitleFontSize = useCallback((size: string) => {
        setSettings((prev) => ({ ...prev, titleFontSize: size }));
        localStorage.setItem('titleFontSize', size);
    }, []);

    const setListSpacing = useCallback((spacing: string) => {
        setSettings((prev) => ({ ...prev, listSpacing: spacing }));
        localStorage.setItem('listSpacing', spacing);
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const value = useMemo<SettingsContextValue>(
        () => ({
            ...settings,
            setTheme,
            setOpenLinkInNewTab,
            toggleOpenLinksInNewTab,
            setTitleFontSize,
            setListSpacing,
            toggleSettings,
        }),
        [
            settings,
            setTheme,
            setOpenLinkInNewTab,
            toggleOpenLinksInNewTab,
            setTitleFontSize,
            setListSpacing,
            toggleSettings,
        ],
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return ctx;
}
