import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings } from '../types';

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
  openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
    ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
    : false,
  theme: 'default',
  titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
  listSpacing: localStorage.getItem('listSpacing') ?? '0',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const setTheme = useCallback((theme: string) => {
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      const theme = event.matches ? 'night' : 'default';
      setTheme(theme);
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setSettings(prev => ({ ...prev, theme: savedTheme }));
    } else if (darkColorSchemeMedia.matches) {
      setTheme('night');
    }

    darkColorSchemeMedia.addEventListener('change', handleChange);
    return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
  }, [setTheme]);

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

  const setFont = useCallback((fontSize: string) => {
    setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
    localStorage.setItem('titleFontSize', fontSize);
  }, []);

  const setSpacing = useCallback((listSpace: string) => {
    setSettings(prev => ({ ...prev, listSpacing: listSpace }));
    localStorage.setItem('listSpacing', listSpace);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
