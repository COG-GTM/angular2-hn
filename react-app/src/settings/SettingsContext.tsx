// Ported from src/app/shared/services/settings.service.ts
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Settings, Theme } from '../types';

export const THEMES: { value: Theme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'night', label: 'Night' },
  { value: 'amoledblack', label: 'Black (AMOLED)' },
];

export const STORAGE_KEYS = {
  theme: 'theme',
  openLinkInNewTab: 'openLinkInNewTab',
  titleFontSize: 'titleFontSize',
  listSpacing: 'listSpacing',
} as const;

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function isTheme(value: unknown): value is Theme {
  return THEMES.some((t) => t.value === value);
}

function darkSchemeMedia(): MediaQueryList | null {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(DARK_SCHEME_QUERY)
    : null;
}

function readOpenLinkInNewTab(): boolean {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.openLinkInNewTab) ?? 'false') === true;
  } catch {
    return false;
  }
}

export function loadSettings(): Settings {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  return {
    showSettings: false,
    openLinkInNewTab: readOpenLinkInNewTab(),
    theme: isTheme(savedTheme) ? savedTheme : darkSchemeMedia()?.matches ? 'night' : 'default',
    titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) || '16',
    listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) || '0',
  };
}

export interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Theme) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (spacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const setTheme = useCallback((theme: Theme) => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    setSettings((s) => ({ ...s, theme }));
  }, []);

  useEffect(() => {
    const media = darkSchemeMedia();
    if (!media) return;
    const onChange = (e: MediaQueryListEvent) => setTheme(e.matches ? 'night' : 'default');
    media.addEventListener('change', onChange);
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
          localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
          return { ...s, openLinkInNewTab };
        }),
      setFont: (titleFontSize: string) => {
        localStorage.setItem(STORAGE_KEYS.titleFontSize, titleFontSize);
        setSettings((s) => ({ ...s, titleFontSize }));
      },
      setSpacing: (listSpacing: string) => {
        localStorage.setItem(STORAGE_KEYS.listSpacing, listSpacing);
        setSettings((s) => ({ ...s, listSpacing }));
      },
    }),
    [settings, setTheme]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used inside <SettingsProvider>');
  }
  return ctx;
}
