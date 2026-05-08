import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings } from '../models/settings';
import { SettingsContext } from './settingsContextDef';

function getInitialSettings(): Settings {
  const savedTheme = localStorage.getItem('theme');
  const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
  let theme = 'default';
  if (savedTheme) {
    theme = savedTheme;
  } else if (darkMedia.matches) {
    theme = 'night';
  }

  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
      ? JSON.parse(localStorage.getItem('openLinkInNewTab') as string) as boolean
      : false,
    theme,
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  const handleColorSchemeChange = useCallback((event: MediaQueryListEvent) => {
    const newTheme = event.matches ? 'night' : 'default';
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    localStorage.setItem('theme', newTheme);
  }, []);

  useEffect(() => {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    darkMedia.addEventListener('change', handleColorSchemeChange);
    return () => {
      darkMedia.removeEventListener('change', handleColorSchemeChange);
    };
  }, [handleColorSchemeChange]);

  const toggleSettings = useCallback(() => {
    setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((prev) => {
      const newVal = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
      return { ...prev, openLinkInNewTab: newVal };
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
    <SettingsContext.Provider
      value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
