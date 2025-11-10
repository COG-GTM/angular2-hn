import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings } from '../types';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const titleFontSize = localStorage.getItem('titleFontSize');
    const listSpacing = localStorage.getItem('listSpacing');
    
    return {
      showSettings: false,
      openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
      theme: 'default', // Will be set by initTheme
      titleFontSize: titleFontSize || '16',
      listSpacing: listSpacing || '0',
    };
  });

  const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  const handleSystemPreferredColorSchemeChange = useCallback((event: MediaQueryListEvent) => {
    const theme = event.matches ? 'night' : 'default';
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setSettings(prev => ({ ...prev, theme: savedTheme }));
    } else {
      const initialTheme = darkColorSchemeMedia.matches ? 'night' : 'default';
      setSettings(prev => ({ ...prev, theme: initialTheme }));
      localStorage.setItem('theme', initialTheme);
    }
  }, [darkColorSchemeMedia.matches]);

  useEffect(() => {
    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
    
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, [darkColorSchemeMedia, handleSystemPreferredColorSchemeChange]);

  const toggleSettings = useCallback(() => {
    setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings(prev => {
      const newValue = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newValue));
      return { ...prev, openLinkInNewTab: newValue };
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

  const value: SettingsContextType = {
    settings,
    toggleSettings,
    toggleOpenLinksInNewTab,
    setTheme,
    setFont,
    setSpacing,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const useTheme = () => {
  const { settings, setTheme } = useSettings();
  return {
    theme: settings.theme,
    setTheme,
  };
};
