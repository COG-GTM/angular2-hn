/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Settings } from '../types/settings';

const STORAGE_KEYS = {
  openLinkInNewTab: 'openLinkInNewTab',
  theme: 'theme',
  titleFontSize: 'titleFontSize',
  listSpacing: 'listSpacing',
} as const;

function readStoredBoolean(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    return Boolean(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

function readStoredString(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function getInitialTheme(): string {
  if (typeof window === 'undefined') return 'default';
  const saved = window.localStorage.getItem(STORAGE_KEYS.theme);
  if (saved) return saved;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'night';
  }
  return 'default';
}

function getInitialSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: readStoredBoolean(STORAGE_KEYS.openLinkInNewTab, false),
    theme: getInitialTheme(),
    titleFontSize: readStoredString(STORAGE_KEYS.titleFontSize, '16'),
    listSpacing: readStoredString(STORAGE_KEYS.listSpacing, '0'),
  };
}

export interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => getInitialSettings());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      if (window.localStorage.getItem(STORAGE_KEYS.theme)) return;
      const nextTheme = event.matches ? 'night' : 'default';
      setSettings((prev) => ({ ...prev, theme: nextTheme }));
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.openLinkInNewTab;
      window.localStorage.setItem(
        STORAGE_KEYS.openLinkInNewTab,
        JSON.stringify(next)
      );
      return { ...prev, openLinkInNewTab: next };
    });
  }, []);

  const setTheme = useCallback((theme: string) => {
    setSettings((prev) => {
      window.localStorage.setItem(STORAGE_KEYS.theme, theme);
      return { ...prev, theme };
    });
  }, []);

  const setFont = useCallback((fontSize: string) => {
    setSettings((prev) => {
      window.localStorage.setItem(STORAGE_KEYS.titleFontSize, fontSize);
      return { ...prev, titleFontSize: fontSize };
    });
  }, []);

  const setSpacing = useCallback((listSpace: string) => {
    setSettings((prev) => {
      window.localStorage.setItem(STORAGE_KEYS.listSpacing, listSpace);
      return { ...prev, listSpacing: listSpace };
    });
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

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}

export { SettingsContext };
