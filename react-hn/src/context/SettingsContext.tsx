import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Settings } from '../models/settings';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedTheme = localStorage.getItem('theme');
    return {
      showSettings: false,
      openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
        ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
        : false,
      theme: savedTheme || 'default',
      titleFontSize: localStorage.getItem('titleFontSize') || '16',
      listSpacing: localStorage.getItem('listSpacing') || '0',
    };
  });

  const themeInitialized = useRef(false);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      const theme = event.matches ? 'night' : 'default';
      setSettings(prev => ({ ...prev, theme }));
      localStorage.setItem('theme', theme);
    };

    // If no saved theme, use system preference
    if (!localStorage.getItem('theme') && !themeInitialized.current) {
      themeInitialized.current = true;
      if (darkColorSchemeMedia.matches) {
        setSettings(prev => ({ ...prev, theme: 'night' }));
      }
    }

    darkColorSchemeMedia.addEventListener('change', handleChange);
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleChange);
    };
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings(prev => {
      const newVal = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
      return { ...prev, openLinkInNewTab: newVal };
    });
  }, []);

  const setTheme = useCallback((theme: string) => {
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  const setFont = useCallback((fontSize: string) => {
    setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
    localStorage.setItem('titleFontSize', fontSize);
  }, []);

  const setSpacing = useCallback((listSpace: string) => {
    setSettings(prev => ({ ...prev, listSpacing: listSpace }));
    localStorage.setItem('listSpacing', listSpace);
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
