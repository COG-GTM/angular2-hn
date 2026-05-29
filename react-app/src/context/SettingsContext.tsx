import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings } from '../types';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

function getInitialSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
      ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
      : false,
    theme: localStorage.getItem('theme') || 'default',
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const initial = getInitialSettings();
    if (!localStorage.getItem('theme')) {
      const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
      initial.theme = darkMedia.matches ? 'night' : 'default';
    }
    return initial;
  });

  useEffect(() => {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setSettings(prev => ({ ...prev, theme: e.matches ? 'night' : 'default' }));
      }
    };
    darkMedia.addEventListener('change', handler);
    return () => darkMedia.removeEventListener('change', handler);
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings(prev => {
      const newVal = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
      return { ...prev, openLinkInNewTab: newVal };
    });
  }, []);

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setFont = useCallback((fontSize: string) => {
    localStorage.setItem('titleFontSize', fontSize);
    setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
  }, []);

  const setSpacing = useCallback((listSpace: string) => {
    localStorage.setItem('listSpacing', listSpace);
    setSettings(prev => ({ ...prev, listSpacing: listSpace }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
