import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

import { Settings } from '../models/settings';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function initialSettings(): Settings {
  const storedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  return {
    showSettings: false,
    openLinkInNewTab: storedOpenLinkInNewTab ? JSON.parse(storedOpenLinkInNewTab) : false,
    theme:
      localStorage.getItem('theme') ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'default'),
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  const setTheme = useCallback((theme: string) => {
    setSettings((prev) => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'night' : 'default');
    };
    darkColorSchemeMedia.addEventListener('change', handleChange);
    return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
  }, [setTheme]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setTheme,
      toggleSettings: () => setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings })),
      toggleOpenLinksInNewTab: () =>
        setSettings((prev) => {
          const openLinkInNewTab = !prev.openLinkInNewTab;
          localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
          return { ...prev, openLinkInNewTab };
        }),
      setFont: (titleFontSize: string) => {
        setSettings((prev) => ({ ...prev, titleFontSize }));
        localStorage.setItem('titleFontSize', titleFontSize);
      },
      setSpacing: (listSpacing: string) => {
        setSettings((prev) => ({ ...prev, listSpacing }));
        localStorage.setItem('listSpacing', listSpacing);
      },
    }),
    [settings, setTheme]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
