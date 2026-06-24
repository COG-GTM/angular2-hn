import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = {
      openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
        ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
        : false,
      titleFontSize: localStorage.getItem('titleFontSize') || '16',
      listSpacing: localStorage.getItem('listSpacing') || '0',
      theme: 'default',
      showSettings: false,
    };
    return saved;
  });

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const setTheme = useCallback((theme: string) => {
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  useEffect(() => {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'night' : 'default');
      }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setSettings(prev => ({ ...prev, theme: savedTheme }));
    } else {
      setSettings(prev => ({
        ...prev,
        theme: darkMedia.matches ? 'night' : 'default',
      }));
    }

    darkMedia.addEventListener('change', handler);
    return () => darkMedia.removeEventListener('change', handler);
  }, [setTheme]);

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

  const setFont = useCallback((fontSize: string) => {
    setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
    localStorage.setItem('titleFontSize', fontSize);
  }, []);

  const setSpacing = useCallback((listSpace: string) => {
    setSettings(prev => ({ ...prev, listSpacing: listSpace }));
    localStorage.setItem('listSpacing', listSpace);
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
