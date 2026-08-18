import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { Settings } from '../models/settings';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function initialSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const titleFontSize = localStorage.getItem('titleFontSize');
  const listSpacing = localStorage.getItem('listSpacing');

  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme: localStorage.getItem('theme') || 'default',
    titleFontSize: titleFontSize ? titleFontSize : '16',
    listSpacing: listSpacing ? listSpacing : '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  const setTheme = useCallback((theme: string) => {
    setSettings((current) => ({ ...current, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  // Follow the system preferred color scheme while no theme has been saved yet.
  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setTheme(event.matches ? 'night' : 'default');
    };

    darkColorSchemeMedia.addEventListener('change', handleChange);

    if (!localStorage.getItem('theme')) {
      handleChange(darkColorSchemeMedia);
    }

    return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
  }, [setTheme]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setTheme,
      toggleSettings: () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
      toggleOpenLinksInNewTab: () =>
        setSettings((current) => {
          const openLinkInNewTab = !current.openLinkInNewTab;
          localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
          return { ...current, openLinkInNewTab };
        }),
      setFont: (titleFontSize: string) => {
        setSettings((current) => ({ ...current, titleFontSize }));
        localStorage.setItem('titleFontSize', titleFontSize);
      },
      setSpacing: (listSpacing: string) => {
        setSettings((current) => ({ ...current, listSpacing }));
        localStorage.setItem('listSpacing', listSpacing);
      },
    }),
    [settings, setTheme]
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
