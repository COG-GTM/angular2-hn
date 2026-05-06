import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Settings } from '../models';

interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function getInitialTheme(): string {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'night';
    }
    return 'default';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>({
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: getInitialTheme(),
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    });

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                setSettings(prev => ({ ...prev, theme: e.matches ? 'night' : 'default' }));
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings(prev => {
            const next = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
            return { ...prev, openLinkInNewTab: next };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings(prev => ({ ...prev, theme }));
    }, []);

    const setFont = useCallback((fontSize: string) => {
        localStorage.setItem('titleFontSize', fontSize);
        setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        localStorage.setItem('listSpacing', listSpace);
        setSettings(prev => ({ ...prev, listSpacing: listSpace }));
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextType {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}
