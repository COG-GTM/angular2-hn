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

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (size: string) => void;
  setSpacing: (spacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function readBoolean(key: string): boolean {
  const stored = localStorage.getItem(key);
  if (!stored) return false;
  try {
    return Boolean(JSON.parse(stored));
  } catch {
    return false;
  }
}

function readString(key: string, fallback: string): string {
  const stored = localStorage.getItem(key);
  return stored ?? fallback;
}

function getInitialSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: readBoolean('openLinkInNewTab'),
    theme: 'default',
    titleFontSize: readString('titleFontSize', '16'),
    listSpacing: readString('listSpacing', '0'),
  };
}

function applyDarkSchemeTheme(settings: Settings, isDark: boolean): Settings {
  if (isDark) {
    return { ...settings, theme: 'night' };
  }
  return { ...settings, theme: 'default' };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    setSettings((prev) => applyDarkSchemeTheme(prev, darkColorSchemeMedia.matches));

    const handler = (event: MediaQueryListEvent) => {
      setSettings((prev) => applyDarkSchemeTheme(prev, event.matches));
    };

    if (typeof darkColorSchemeMedia.addEventListener === 'function') {
      darkColorSchemeMedia.addEventListener('change', handler);
      return () => darkColorSchemeMedia.removeEventListener('change', handler);
    }

    darkColorSchemeMedia.addListener(handler);
    return () => darkColorSchemeMedia.removeListener(handler);
  }, []);

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
  }, []);

  const setFont = useCallback((size: string) => {
    localStorage.setItem('titleFontSize', size);
    setSettings((prev) => ({ ...prev, titleFontSize: size }));
  }, []);

  const setSpacing = useCallback((spacing: string) => {
    localStorage.setItem('listSpacing', spacing);
    setSettings((prev) => ({ ...prev, listSpacing: spacing }));
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

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
