import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings } from '../types';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function getInitialSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const titleFontSize = localStorage.getItem('titleFontSize');
  const listSpacing = localStorage.getItem('listSpacing');

  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme: 'default',
    titleFontSize: titleFontSize ?? '16',
    listSpacing: listSpacing ?? '0',
  };
}

function resolveInitialTheme(darkMedia: MediaQueryList): string {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return darkMedia.matches ? 'night' : 'default';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const initial = getInitialSettings();
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    initial.theme = resolveInitialTheme(darkMedia);
    return initial;
  });

  useEffect(() => {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const theme = e.matches ? 'night' : 'default';
      setSettings((prev) => ({ ...prev, theme }));
      localStorage.setItem('theme', theme);
    };
    darkMedia.addEventListener('change', handler);
    return () => darkMedia.removeEventListener('change', handler);
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
      return { ...prev, openLinkInNewTab: next };
    });
  }, []);

  const setTheme = useCallback((theme: string) => {
    setSettings((prev) => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  const setFont = useCallback((fontSize: string) => {
    setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
    localStorage.setItem('titleFontSize', fontSize);
  }, []);

  const setSpacing = useCallback((listSpace: string) => {
    setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
    localStorage.setItem('listSpacing', listSpace);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
