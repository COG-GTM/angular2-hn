import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings } from '../models';
import {
  DARK_COLOR_SCHEME_QUERY,
  SettingsContext,
  readStoredSettings,
  type SettingsContextValue,
} from './settingsContext';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(readStoredSettings);

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((current) => ({ ...current, theme }));
  }, []);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');

    darkColorSchemeMedia.addEventListener('change', handleChange);

    return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
  }, [setTheme]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setTheme,
      toggleSettings: () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
      toggleOpenLinksInNewTab: () =>
        setSettings((current) => {
          const openLinkInNewTab = !current.openLinkInNewTab;
          localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
          return { ...current, openLinkInNewTab };
        }),
      setFont: (titleFontSize: string) => {
        localStorage.setItem('titleFontSize', titleFontSize);
        setSettings((current) => ({ ...current, titleFontSize }));
      },
      setSpacing: (listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        setSettings((current) => ({ ...current, listSpacing }));
      },
    }),
    [settings, setTheme]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
