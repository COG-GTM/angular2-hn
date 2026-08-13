import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';

import { Settings } from '../models/settings';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readInitialSettings(): Settings {
  const storedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  return {
    showSettings: false,
    openLinkInNewTab: storedOpenLinkInNewTab ? JSON.parse(storedOpenLinkInNewTab) : false,
    theme: localStorage.getItem('theme') ?? 'default',
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(readInitialSettings);
  const hasSavedTheme = useRef<boolean>(localStorage.getItem('theme') !== null);

  const setTheme = useCallback((theme: string) => {
    hasSavedTheme.current = true;
    localStorage.setItem('theme', theme);
    setSettings(current => ({ ...current, theme }));
  }, []);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setTheme(event.matches ? 'night' : 'default');
    };

    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

    if (!hasSavedTheme.current) {
      handleSystemPreferredColorSchemeChange(darkColorSchemeMedia);
    }

    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, [setTheme]);

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    toggleSettings: () => setSettings(current => ({ ...current, showSettings: !current.showSettings })),
    toggleOpenLinksInNewTab: () =>
      setSettings(current => {
        const openLinkInNewTab = !current.openLinkInNewTab;
        localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
        return { ...current, openLinkInNewTab };
      }),
    setTheme,
    setFont: (titleFontSize: string) => {
      localStorage.setItem('titleFontSize', titleFontSize);
      setSettings(current => ({ ...current, titleFontSize }));
    },
    setSpacing: (listSpacing: string) => {
      localStorage.setItem('listSpacing', listSpacing);
      setSettings(current => ({ ...current, listSpacing }));
    },
  }), [settings, setTheme]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
