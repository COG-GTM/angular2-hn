import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Settings } from '../models/Settings';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (spacing: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    showSettings: false,
    openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') || 'false'),
    theme: localStorage.getItem('theme') || 'default',
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0'
  });

  useEffect(() => {
    const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const theme = e.matches ? 'night' : 'default';
      setTheme(theme);
    };

    if (!localStorage.getItem('theme')) {
      const theme = darkModeMedia.matches ? 'night' : 'default';
      setSettings(prev => ({ ...prev, theme }));
    }

    darkModeMedia.addEventListener('change', handleChange);
    return () => darkModeMedia.removeEventListener('change', handleChange);
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
    localStorage.setItem('theme', theme);
    setSettings(prev => ({ ...prev, theme }));
  };

  const setFont = (fontSize: string) => {
    localStorage.setItem('titleFontSize', fontSize);
    setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
  };

  const setSpacing = (spacing: string) => {
    localStorage.setItem('listSpacing', spacing);
    setSettings(prev => ({ ...prev, listSpacing: spacing }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
