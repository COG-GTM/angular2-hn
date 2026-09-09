import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Settings } from '../models/settings';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const getInitialSettings = (): Settings => {
  const savedTheme = localStorage.getItem('theme');
  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
      ? JSON.parse(localStorage.getItem('openLinkInNewTab') as string)
      : false,
    theme: savedTheme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'default'),
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
    media.addEventListener('change', handleChange);
    if (!savedTheme) {
      setTheme(media.matches ? 'night' : 'default');
    }
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggleSettings = () => setSettings((current) => ({ ...current, showSettings: !current.showSettings }));

  const toggleOpenLinksInNewTab = () =>
    setSettings((current) => {
      const openLinkInNewTab = !current.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
      return { ...current, openLinkInNewTab };
    });

  const setTheme = (theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((current) => ({ ...current, theme }));
  };

  const setFont = (titleFontSize: string) => {
    localStorage.setItem('titleFontSize', titleFontSize);
    setSettings((current) => ({ ...current, titleFontSize }));
  };

  const setSpacing = (listSpacing: string) => {
    localStorage.setItem('listSpacing', listSpacing);
    setSettings((current) => ({ ...current, listSpacing }));
  };

  return (
    <SettingsContext.Provider
      value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
