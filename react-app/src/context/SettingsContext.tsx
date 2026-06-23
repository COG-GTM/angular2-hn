import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Settings } from '../models/settings';

interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings(): SettingsContextType {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
    return ctx;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(() => ({
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize')
            ? localStorage.getItem('titleFontSize')!
            : '16',
        listSpacing: localStorage.getItem('listSpacing')
            ? localStorage.getItem('listSpacing')!
            : '0',
    }));

    // Initialize theme
    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (event: MediaQueryListEvent) => {
            const theme = event.matches ? 'night' : 'default';
            setSettings(prev => {
                const next = { ...prev, theme };
                localStorage.setItem('theme', theme);
                return next;
            });
        };

        darkColorSchemeMedia.addEventListener('change', handleChange);

        // Init theme on mount
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings(prev => ({ ...prev, theme: savedTheme }));
        } else {
            // Dispatch to check current preference
            if (darkColorSchemeMedia.matches) {
                setSettings(prev => {
                    const next = { ...prev, theme: 'night' };
                    localStorage.setItem('theme', 'night');
                    return next;
                });
            }
        }

        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleChange);
        };
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings(prev => {
            const next = { ...prev, openLinkInNewTab: !prev.openLinkInNewTab };
            localStorage.setItem('openLinkInNewTab', JSON.stringify(next.openLinkInNewTab));
            return next;
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        setSettings(prev => {
            const next = { ...prev, theme };
            localStorage.setItem('theme', next.theme);
            return next;
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings(prev => {
            const next = { ...prev, titleFontSize: fontSize };
            localStorage.setItem('titleFontSize', next.titleFontSize);
            return next;
        });
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        setSettings(prev => {
            const next = { ...prev, listSpacing: listSpace };
            localStorage.setItem('listSpacing', next.listSpacing);
            return next;
        });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}>
            {children}
        </SettingsContext.Provider>
    );
}
