/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Settings } from '../types/settings';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function getInitialSettings(): Settings {
  const savedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const savedTheme = localStorage.getItem('theme');
  const savedTitleFontSize = localStorage.getItem('titleFontSize');
  const savedListSpacing = localStorage.getItem('listSpacing');

  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  return {
    showSettings: false,
    openLinkInNewTab: savedOpenLinkInNewTab ? JSON.parse(savedOpenLinkInNewTab) : false,
    theme: savedTheme ? savedTheme : prefersDark ? 'night' : 'default',
    titleFontSize: savedTitleFontSize ? savedTitleFontSize : '16',
    listSpacing: savedListSpacing ? savedListSpacing : '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  // Mirror SettingsService: react to the system's preferred color scheme changes.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'night' : 'default');
    };
    darkColorSchemeMedia.addEventListener('change', handleChange);
    return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
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
    () => ({
      settings,
      toggleSettings,
      toggleOpenLinksInNewTab,
      setTheme,
      setFont,
      setSpacing,
    }),
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
