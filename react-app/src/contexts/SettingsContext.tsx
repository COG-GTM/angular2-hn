import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>({
    showSettings: false,
    openLinkInNewTab: localStorage.getItem("openLinkInNewTab") 
      ? JSON.parse(localStorage.getItem("openLinkInNewTab")!) 
      : false,
    theme: 'default',
    titleFontSize: localStorage.getItem("titleFontSize") || '16',
    listSpacing: localStorage.getItem("listSpacing") || '0',
  });

  const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
    const theme = event.matches ? 'night' : 'default';
    setTheme(theme);
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setSettings(prev => ({ ...prev, theme: savedTheme }));
    } else {
      const event = new MediaQueryListEvent('change', {
        media: darkColorSchemeMedia.media,
        matches: darkColorSchemeMedia.matches
      });
      handleSystemPreferredColorSchemeChange(event);
    }
  };

  useEffect(() => {
    initTheme();
    
    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
    
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
      localStorage.setItem("openLinkInNewTab", JSON.stringify(newValue));
      return { ...prev, openLinkInNewTab: newValue };
    });
  };

  const setTheme = (theme: string) => {
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem("theme", theme);
  };

  const setFont = (fontSize: string) => {
    setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
    localStorage.setItem("titleFontSize", fontSize);
  };

  const setSpacing = (listSpace: string) => {
    setSettings(prev => ({ ...prev, listSpacing: listSpace }));
    localStorage.setItem("listSpacing", listSpace);
  };

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
}
