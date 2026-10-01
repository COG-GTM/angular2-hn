/*
 * Port of src/app/shared/services/settings.service.ts: same localStorage
 * keys, defaults, serialization and prefers-color-scheme behaviour.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, type Settings, type SettingsContextValue, type Theme } from '../types/settings';

export const SETTINGS_STORAGE_KEYS = {
  theme: 'theme',
  titleFontSize: 'titleFontSize',
  listSpacing: 'listSpacing',
  openLinkInNewTab: 'openLinkInNewTab',
} as const;

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function themeForColorScheme(prefersDark: boolean): Theme {
  return prefersDark ? 'night' : 'default';
}

/**
 * Initial settings, evaluated like the Angular service: stored values when
 * present (truthy), otherwise defaults; with no saved theme, the theme follows
 * the system colour scheme.
 */
export function readInitialSettings(): Settings {
  const storedOpenLink = localStorage.getItem(SETTINGS_STORAGE_KEYS.openLinkInNewTab);
  const savedTheme = localStorage.getItem(SETTINGS_STORAGE_KEYS.theme);
  return {
    showSettings: DEFAULT_SETTINGS.showSettings,
    openLinkInNewTab: storedOpenLink ? Boolean(JSON.parse(storedOpenLink)) : DEFAULT_SETTINGS.openLinkInNewTab,
    theme: savedTheme
      ? (savedTheme as Theme)
      : themeForColorScheme(window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches),
    titleFontSize: localStorage.getItem(SETTINGS_STORAGE_KEYS.titleFontSize) || DEFAULT_SETTINGS.titleFontSize,
    listSpacing: localStorage.getItem(SETTINGS_STORAGE_KEYS.listSpacing) || DEFAULT_SETTINGS.listSpacing,
  };
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(readInitialSettings);

  const setTheme = useCallback((theme: Theme) => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.theme, theme);
    setSettings((s) => ({ ...s, theme }));
  }, []);

  useEffect(() => {
    const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
    const onChange = (event: MediaQueryListEvent) => setTheme(themeForColorScheme(event.matches));
    media.addEventListener('change', onChange);
    // Angular's initTheme() dispatches a synthetic change event when no theme
    // is saved, which persists the system-derived theme already in state.
    if (!localStorage.getItem(SETTINGS_STORAGE_KEYS.theme)) {
      localStorage.setItem(SETTINGS_STORAGE_KEYS.theme, themeForColorScheme(media.matches));
    }
    return () => media.removeEventListener('change', onChange);
  }, [setTheme]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setTheme,
      toggleSettings: () => setSettings((s) => ({ ...s, showSettings: !s.showSettings })),
      toggleOpenLinksInNewTab: () =>
        setSettings((s) => {
          const openLinkInNewTab = !s.openLinkInNewTab;
          localStorage.setItem(SETTINGS_STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
          return { ...s, openLinkInNewTab };
        }),
      setFont: (titleFontSize: string) => {
        localStorage.setItem(SETTINGS_STORAGE_KEYS.titleFontSize, titleFontSize);
        setSettings((s) => ({ ...s, titleFontSize }));
      },
      setSpacing: (listSpacing: string) => {
        localStorage.setItem(SETTINGS_STORAGE_KEYS.listSpacing, listSpacing);
        setSettings((s) => ({ ...s, listSpacing }));
      },
    }),
    [settings, setTheme],
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
