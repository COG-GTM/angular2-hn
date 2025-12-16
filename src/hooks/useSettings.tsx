import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings } from '../models';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const defaultSettings: Settings = {
  showSettings: false,
  openLinkInNewTab: localStorage.getItem('openLinkInNewTab') === 'true',
  theme: localStorage.getItem('theme') || 'default',
  titleFontSize: localStorage.getItem('titleFontSize') || '16',
  listSpacing: localStorage.getItem('listSpacing') || '0',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const handleSystemPreferredColorSchemeChange = useCallback((event: MediaQueryListEvent) => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const theme = event.matches ? 'night' : 'default';
      setSettings(prev => ({ ...prev, theme }));
      localStorage.setItem('theme', theme);
    }
  }, []);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const theme = darkColorSchemeMedia.matches ? 'night' : 'default';
      setSettings(prev => ({ ...prev, theme }));
    }

    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
    
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, [handleSystemPreferredColorSchemeChange]);

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

  return (
    <SettingsContext.Provider
      value={{
        settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
