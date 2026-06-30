import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Settings } from '../models/settings';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readLocalStorage<T>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key);
  if (stored === null) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return stored as unknown as T;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({
    showSettings: false,
    openLinkInNewTab: readLocalStorage<boolean>('openLinkInNewTab', false),
    theme: localStorage.getItem('theme') || 'default',
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0',
  }));

  useEffect(() => {
    if (localStorage.getItem('theme')) return;

    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // Once the user has explicitly chosen a theme (persisted to localStorage),
      // stop letting OS color-scheme changes override their choice.
      if (localStorage.getItem('theme')) return;
      setSettings(prev => ({ ...prev, theme: e.matches ? 'night' : 'default' }));
    };

    // Set initial theme based on system preference
    if (darkMedia.matches) {
      setSettings(prev => ({ ...prev, theme: 'night' }));
    }

    darkMedia.addEventListener('change', handler);
    return () => darkMedia.removeEventListener('change', handler);
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings(prev => {
      const next = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
      return { ...prev, openLinkInNewTab: next };
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
