import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { Settings } from '../models';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const darkColorSchemeMedia =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

function getInitialTheme(): string {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return darkColorSchemeMedia && darkColorSchemeMedia.matches ? 'night' : 'default';
}

function getInitialSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
      ? JSON.parse(localStorage.getItem('openLinkInNewTab') as string)
      : false,
    theme: getInitialTheme(),
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  // Mirror SettingsService: keep the theme in sync with the system color scheme.
  useEffect(() => {
    if (!darkColorSchemeMedia) {
      return;
    }
    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'night' : 'default');
    };
    darkColorSchemeMedia.addEventListener('change', handleChange);

    // initTheme: when no saved theme, derive it from the system preference.
    if (!localStorage.getItem('theme')) {
      setTheme(darkColorSchemeMedia.matches ? 'night' : 'default');
    }

    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleChange);
    };
  }, [setTheme]);

  const toggleSettings = useCallback(() => {
    setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((prev) => {
      const openLinkInNewTab = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
      return { ...prev, openLinkInNewTab };
    });
  }, []);

  const setFont = useCallback((fontSize: string) => {
    localStorage.setItem('titleFontSize', fontSize);
    setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
  }, []);

  const setSpacing = useCallback((listSpace: string) => {
    localStorage.setItem('listSpacing', listSpace);
    setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
