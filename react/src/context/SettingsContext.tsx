import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Settings, Theme } from '../types/models';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Theme) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (spacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function readSetting(key: string, fallback: string): string {
  return localStorage.getItem(key) ?? fallback;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedTheme = localStorage.getItem('theme');
    const theme: Theme = savedTheme === 'night' || savedTheme === 'amoledblack' ? savedTheme : 'default';
    return {
      showSettings: false,
      openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') ?? 'false') as boolean,
      theme,
      titleFontSize: readSetting('titleFontSize', '16'),
      listSpacing: readSetting('listSpacing', '0')
    };
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === null) {
        setSettings((current) => ({ ...current, theme: event.matches ? 'night' : 'default' }));
      }
    };
    if (localStorage.getItem('theme') === null) {
      setSettings((current) => ({ ...current, theme: media.matches ? 'night' : 'default' }));
    }
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    toggleSettings: () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
    toggleOpenLinksInNewTab: () => setSettings((current) => {
      const next = !current.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
      return { ...current, openLinkInNewTab: next };
    }),
    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      setSettings((current) => ({ ...current, theme }));
    },
    setFont: (titleFontSize) => {
      localStorage.setItem('titleFontSize', titleFontSize);
      setSettings((current) => ({ ...current, titleFontSize }));
    },
    setSpacing: (listSpacing) => {
      localStorage.setItem('listSpacing', listSpacing);
      setSettings((current) => ({ ...current, listSpacing }));
    }
  }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return value;
}
