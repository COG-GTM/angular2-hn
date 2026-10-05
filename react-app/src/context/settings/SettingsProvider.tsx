import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings, Theme } from '../../models';
import { SettingsContext } from './SettingsContext';
import { DARK_SCHEME_QUERY, STORAGE_KEYS, loadInitialSettings, themeForColorScheme } from './storage';

export function SettingsProvider({ children, initial }: { children: ReactNode; initial?: Partial<Settings> }) {
  const [settings, setSettings] = useState<Settings>(() => ({ ...loadInitialSettings(), ...initial }));

  const setTheme = useCallback((theme: Theme) => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    setSettings((current) => ({ ...current, theme }));
  }, []);

  useEffect(() => {
    // Angular persisted the system-derived theme on first load and followed later system changes.
    if (!localStorage.getItem(STORAGE_KEYS.theme)) {
      localStorage.setItem(STORAGE_KEYS.theme, settings.theme);
    }
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const onChange = (event: MediaQueryListEvent) => setTheme(themeForColorScheme(event.matches));
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTheme]);

  const toggleSettings = useCallback(() => {
    setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((current) => {
      const openLinkInNewTab = !current.openLinkInNewTab;
      localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
      return { ...current, openLinkInNewTab };
    });
  }, []);

  const setFont = useCallback((titleFontSize: string) => {
    localStorage.setItem(STORAGE_KEYS.titleFontSize, titleFontSize);
    setSettings((current) => ({ ...current, titleFontSize }));
  }, []);

  const setSpacing = useCallback((listSpacing: string) => {
    localStorage.setItem(STORAGE_KEYS.listSpacing, listSpacing);
    setSettings((current) => ({ ...current, listSpacing }));
  }, []);

  const value = useMemo(
    () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
