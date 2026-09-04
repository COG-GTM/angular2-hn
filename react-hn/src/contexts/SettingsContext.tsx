import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Settings } from '../models/Settings';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function readInitialSettings(): Settings {
  const storedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const storedTheme = localStorage.getItem('theme');

  return {
    showSettings: false,
    openLinkInNewTab: storedOpenLinkInNewTab ? JSON.parse(storedOpenLinkInNewTab) : false,
    theme: storedTheme || (window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches ? 'night' : 'default'),
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0'
  };
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(readInitialSettings);

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings(current => ({ ...current, theme }));
  }, []);

  useEffect(() => {
    const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [setTheme]);

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    setTheme,
    toggleSettings: () => setSettings(current => ({ ...current, showSettings: !current.showSettings })),
    toggleOpenLinksInNewTab: () => setSettings(current => {
      const openLinkInNewTab = !current.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
      return { ...current, openLinkInNewTab };
    }),
    setFont: (titleFontSize: string) => {
      localStorage.setItem('titleFontSize', titleFontSize);
      setSettings(current => ({ ...current, titleFontSize }));
    },
    setSpacing: (listSpacing: string) => {
      localStorage.setItem('listSpacing', listSpacing);
      setSettings(current => ({ ...current, listSpacing }));
    }
  }), [settings, setTheme]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
