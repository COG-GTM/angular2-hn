import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings } from '../types';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Settings['theme']) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

const defaultSettings: Settings = {
  showSettings: false,
  openLinkInNewTab: false,
  theme: 'default',
  titleFontSize: '16',
  listSpacing: '0',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialSettings = (): Settings => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const theme = localStorage.getItem('theme') as Settings['theme'] | null;
  const titleFontSize = localStorage.getItem('titleFontSize');
  const listSpacing = localStorage.getItem('listSpacing');

  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme: theme || 'default',
    titleFontSize: titleFontSize || '16',
    listSpacing: listSpacing || '0',
  };
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const theme = event.matches ? 'night' : 'default';
        setSettings((prev) => ({ ...prev, theme }));
      }
    };

    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const theme = darkColorSchemeMedia.matches ? 'night' : 'default';
      setSettings((prev) => ({ ...prev, theme }));
    }

    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((prev) => {
      const newValue = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newValue));
      return { ...prev, openLinkInNewTab: newValue };
    });
  }, []);

  const setTheme = useCallback((theme: Settings['theme']) => {
    setSettings((prev) => {
      localStorage.setItem('theme', theme);
      return { ...prev, theme };
    });
  }, []);

  const setFont = useCallback((fontSize: string) => {
    setSettings((prev) => {
      localStorage.setItem('titleFontSize', fontSize);
      return { ...prev, titleFontSize: fontSize };
    });
  }, []);

  const setSpacing = useCallback((listSpacing: string) => {
    setSettings((prev) => {
      localStorage.setItem('listSpacing', listSpacing);
      return { ...prev, listSpacing };
    });
  }, []);

  const value: SettingsContextType = {
    settings,
    toggleSettings,
    toggleOpenLinksInNewTab,
    setTheme,
    setFont,
    setSpacing,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
