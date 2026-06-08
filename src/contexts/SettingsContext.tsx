import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Settings } from '../models/settings';

interface SettingsContextValue extends Settings {
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function getInitialTheme(): string {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'night';
    return 'default';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [showSettings, setShowSettings] = useState(false);
    const [openLinkInNewTab, setOpenLinkInNewTab] = useState(() => {
        const saved = localStorage.getItem('openLinkInNewTab');
        return saved ? JSON.parse(saved) === true : false;
    });
    const [theme, setThemeState] = useState(getInitialTheme);
    const [titleFontSize, setTitleFontSize] = useState(
        () => localStorage.getItem('titleFontSize') || '16'
    );
    const [listSpacing, setListSpacing] = useState(
        () => localStorage.getItem('listSpacing') || '0'
    );

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                setThemeState(e.matches ? 'night' : 'default');
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggleSettings = useCallback(() => setShowSettings((v) => !v), []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setOpenLinkInNewTab((v: boolean) => {
            const next = !v;
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

    const setSpacing = useCallback((listSpace: string) => {
        setListSpacing(listSpace);
        localStorage.setItem('listSpacing', listSpace);
    }, []);

    const value: SettingsContextValue = {
        showSettings,
        openLinkInNewTab,
        theme,
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
    if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
    return ctx;
}
