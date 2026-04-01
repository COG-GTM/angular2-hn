import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings } from '../models/settings';
import { SettingsContext } from './settingsContextDef';

function getInitialTheme(): string {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'night' : 'default';
}

function getInitialSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
      ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
      : false,
    theme: getInitialTheme(),
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);
  const [userExplicitlySetTheme, setUserExplicitlySetTheme] = useState(
    () => localStorage.getItem('themeSource') === 'user'
  );

  // Subscribe to system color scheme changes — only override if user hasn't explicitly chosen a theme
  useEffect(() => {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      if (!userExplicitlySetTheme) {
        const theme = event.matches ? 'night' : 'default';
        setSettings((prev) => ({ ...prev, theme }));
        localStorage.setItem('theme', theme);
      }
    };
    darkMedia.addEventListener('change', handler);
    return () => darkMedia.removeEventListener('change', handler);
  }, [userExplicitlySetTheme]);

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
    localStorage.setItem('themeSource', 'user');
    setUserExplicitlySetTheme(true);
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
    <SettingsContext.Provider
      value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
