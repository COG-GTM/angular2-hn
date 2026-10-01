/*
 * T0 placeholder: in-memory settings with Angular defaults so the shell can
 * consume `useSettings()` before persistence lands. T2 replaces this file
 * (localStorage + prefers-color-scheme) without changing the exported API.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, type Settings, type SettingsContextValue, type Theme } from '../types/settings';

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      toggleSettings: () => setSettings((s) => ({ ...s, showSettings: !s.showSettings })),
      toggleOpenLinksInNewTab: () => setSettings((s) => ({ ...s, openLinkInNewTab: !s.openLinkInNewTab })),
      setTheme: (theme: Theme) => setSettings((s) => ({ ...s, theme })),
      setFont: (titleFontSize: string) => setSettings((s) => ({ ...s, titleFontSize })),
      setSpacing: (listSpacing: string) => setSettings((s) => ({ ...s, listSpacing })),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
