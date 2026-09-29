import { useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Theme } from '../models/settings';
import { SettingsContext, type SettingsContextValue } from './settingsContext';
import { DARK_COLOR_SCHEME_QUERY, loadSettings, saveSettings, systemTheme } from './settingsStorage';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      setSettings((current) => ({ ...current, theme: systemTheme(event.matches) }));
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      toggleSettings: () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
      toggleOpenLinksInNewTab: () =>
        setSettings((current) => ({ ...current, openLinkInNewTab: !current.openLinkInNewTab })),
      setTheme: (theme: Theme) => setSettings((current) => ({ ...current, theme })),
      setFont: (titleFontSize: string) => setSettings((current) => ({ ...current, titleFontSize })),
      setSpacing: (listSpacing: string) => setSettings((current) => ({ ...current, listSpacing })),
    }),
    [settings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
