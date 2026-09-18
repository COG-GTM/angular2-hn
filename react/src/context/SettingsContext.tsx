import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Settings } from '../models/settings';

export interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function readStored(key: string, fallback: string): string {
  return localStorage.getItem(key) ?? fallback;
}

function initialSettings(): Settings {
  const storedOpenInNewTab = localStorage.getItem('openLinkInNewTab');
  return {
    showSettings: false,
    openLinkInNewTab: storedOpenInNewTab ? (JSON.parse(storedOpenInNewTab) as boolean) : false,
    theme: readStored('theme', 'default'),
    titleFontSize: readStored('titleFontSize', '16'),
    listSpacing: readStored('listSpacing', '0'),
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((current) => ({ ...current, theme }));
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setTheme(event.matches ? 'night' : 'default');
    };

    if (!localStorage.getItem('theme')) {
      handleChange(media);
    }

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [setTheme]);

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

  const setFont = useCallback((titleFontSize: string) => {
    localStorage.setItem('titleFontSize', titleFontSize);
    setSettings((current) => ({ ...current, titleFontSize }));
  }, []);

  const setSpacing = useCallback((listSpacing: string) => {
    localStorage.setItem('listSpacing', listSpacing);
    setSettings((current) => ({ ...current, listSpacing }));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing],
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
