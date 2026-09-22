import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings } from '../models';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (titleFontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function initialSettings(): Settings {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia(DARK_SCHEME_QUERY).matches;

  return {
    showSettings: false,
    openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') ?? 'false') as boolean,
    theme: savedTheme ?? (prefersDark ? 'night' : 'default'),
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  useEffect(() => {
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (localStorage.getItem('theme')) {
        return;
      }
      setSettings((current) => ({ ...current, theme: event.matches ? 'night' : 'default' }));
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((current) => {
      const openLinkInNewTab = !current.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
      return { ...current, openLinkInNewTab };
    });
  }, []);

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((current) => ({ ...current, theme }));
  }, []);

  const setFont = useCallback((titleFontSize: string) => {
    localStorage.setItem('titleFontSize', titleFontSize);
    setSettings((current) => ({ ...current, titleFontSize }));
  }, []);

  const setSpacing = useCallback((listSpacing: string) => {
    localStorage.setItem('listSpacing', listSpacing);
    setSettings((current) => ({ ...current, listSpacing }));
  }, []);

  const value = useMemo(
    () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
