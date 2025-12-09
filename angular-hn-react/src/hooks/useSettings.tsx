import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Settings } from '../types/settings';

interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    setTheme: (theme: string) => void;
    setFont: (size: string) => void;
    setSpacing: (spacing: string) => void;
    setOpenLinkInNewTab: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        const savedTheme = localStorage.getItem('theme');
        const savedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');
        const savedTitleFontSize = localStorage.getItem('titleFontSize');
        const savedListSpacing = localStorage.getItem('listSpacing');

        return {
            showSettings: false,
            openLinkInNewTab: savedOpenLinkInNewTab ? JSON.parse(savedOpenLinkInNewTab) : false,
            theme: savedTheme || 'default',
            titleFontSize: savedTitleFontSize || '16',
            listSpacing: savedListSpacing || '0',
        };
    });

    useEffect(() => {
        document.body.className = settings.theme;
    }, [settings.theme]);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'night' : 'default';
                setSettings((prev) => ({ ...prev, theme: newTheme }));
            }
        };

        if (!localStorage.getItem('theme')) {
            const initialTheme = media.matches ? 'night' : 'default';
            setSettings((prev) => ({ ...prev, theme: initialTheme }));
        }

        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    const toggleSettings = () => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    };

    const setTheme = (theme: string) => {
        setSettings((prev) => ({ ...prev, theme }));
        localStorage.setItem('theme', theme);
    };

    const setFont = (size: string) => {
        setSettings((prev) => ({ ...prev, titleFontSize: size }));
        localStorage.setItem('titleFontSize', size);
    };

    const setSpacing = (spacing: string) => {
        setSettings((prev) => ({ ...prev, listSpacing: spacing }));
        localStorage.setItem('listSpacing', spacing);
    };

    const setOpenLinkInNewTab = (value: boolean) => {
        setSettings((prev) => ({ ...prev, openLinkInNewTab: value }));
        localStorage.setItem('openLinkInNewTab', JSON.stringify(value));
    };

    return (
        <SettingsContext.Provider
            value={{
                settings,
                toggleSettings,
                setTheme,
                setFont,
                setSpacing,
                setOpenLinkInNewTab,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
};
