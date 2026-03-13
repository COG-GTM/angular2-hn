import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Settings } from '../types/settings';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextType>(null!);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedTheme = localStorage.getItem('theme');
    let theme = 'default';
    if (savedTheme) {
      theme = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'night';
    }
    return {
      showSettings: false,
      openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') || 'false'),
      theme,
      titleFontSize: localStorage.getItem('titleFontSize') || '16',
      listSpacing: localStorage.getItem('listSpacing') || '0',
    };
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setSettings(prev => ({ ...prev, theme: e.matches ? 'night' : 'default' }));
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
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
    <SettingsContext.Provider value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
