import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Settings } from '../types/settings';
import { SettingsContext, type SettingsContextValue } from './settingsContext';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function readInitialSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme: localStorage.getItem('theme') ?? 'default',
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(readInitialSettings);

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  useEffect(() => {
    const media = window.matchMedia(DARK_SCHEME_QUERY);

    const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'night' : 'default');
    };

    media.addEventListener('change', handleSystemPreferredColorSchemeChange);

    // initTheme: a saved theme is already applied by readInitialSettings, so only
    // auto-select from the system preference when nothing has been saved yet.
    if (!localStorage.getItem('theme')) {
      setTheme(media.matches ? 'night' : 'default');
    }

    return () => {
      media.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
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

  const setSpacing = useCallback((listSpacing: string) => {
    localStorage.setItem('listSpacing', listSpacing);
    setSettings((prev) => ({ ...prev, listSpacing }));
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
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
