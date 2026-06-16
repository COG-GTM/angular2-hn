import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings } from '../types/settings';

interface SettingsContextValue extends Settings {
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function getInitial<T>(key: string, fallback: T): T {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    try {
        return JSON.parse(stored) as T;
    } catch {
        return stored as unknown as T;
    }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [showSettings, setShowSettings] = useState(false);
    const [openLinkInNewTab, setOpenLinkInNewTab] = useState(() => getInitial('openLinkInNewTab', false));
    const [theme, setThemeState] = useState(() => localStorage.getItem('theme') ?? '');
    const [titleFontSize, setTitleFontSize] = useState(() => localStorage.getItem('titleFontSize') ?? '16');
    const [listSpacing, setListSpacing] = useState(() => localStorage.getItem('listSpacing') ?? '0');

    useEffect(() => {
        if (theme !== '') return;

        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const initial = mql.matches ? 'night' : 'default';
        setThemeState(initial);

        const handler = (e: MediaQueryListEvent) => {
            setThemeState(e.matches ? 'night' : 'default');
        };
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [theme]);

    const toggleSettings = useCallback(() => setShowSettings((s) => !s), []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setOpenLinkInNewTab((prev) => {
            const next = !prev;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
            return next;
        });
    }, []);

    const setTheme = useCallback((t: string) => {
        setThemeState(t);
        localStorage.setItem('theme', t);
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setTitleFontSize(fontSize);
        localStorage.setItem('titleFontSize', fontSize);
    }, []);

    const setSpacing = useCallback((ls: string) => {
        setListSpacing(ls);
        localStorage.setItem('listSpacing', ls);
    }, []);

    const value: SettingsContextValue = {
        showSettings,
        openLinkInNewTab,
        theme: theme || 'default',
        titleFontSize,
        listSpacing,
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
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}
