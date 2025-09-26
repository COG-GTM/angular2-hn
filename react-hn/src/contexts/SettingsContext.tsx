import React, { useEffect, useState } from 'react';
import { Settings } from '../types';
import { SettingsContext } from './SettingsContextDefinition';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>({
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab') ? JSON.parse(localStorage.getItem('openLinkInNewTab')!) : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    });

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
            const theme = event.matches ? 'night' : 'default';
            setTheme(theme);
        };

        const initTheme = () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                setSettings(prev => ({ ...prev, theme: savedTheme }));
            } else {
                handleSystemPreferredColorSchemeChange({ matches: darkColorSchemeMedia.matches } as MediaQueryListEvent);
            }
        };

        darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
        initTheme();

        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
        };
    }, []);

    const toggleSettings = () => {
        setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
    };

    const toggleOpenLinksInNewTab = () => {
        setSettings(prev => {
            const newValue = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(newValue));
            return { ...prev, openLinkInNewTab: newValue };
        });
    };

    const setTheme = (theme: string) => {
        setSettings(prev => ({ ...prev, theme }));
        localStorage.setItem('theme', theme);
    };

    const setFont = (fontSize: string) => {
        setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
        localStorage.setItem('titleFontSize', fontSize);
    };

    const setSpacing = (listSpace: string) => {
        setSettings(prev => ({ ...prev, listSpacing: listSpace }));
        localStorage.setItem('listSpacing', listSpace);
    };

    return (
        <SettingsContext.Provider value={{
            settings,
            toggleSettings,
            toggleOpenLinksInNewTab,
            setTheme,
            setFont,
            setSpacing
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
