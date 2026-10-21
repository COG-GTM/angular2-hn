import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { THEMES, type Settings, type Theme } from '../models';
import { SettingsContext, STORAGE_KEYS } from './context';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function darkSchemeMedia(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia(DARK_SCHEME_QUERY) : null;
}

function isTheme(value: string | null): value is Theme {
  return (THEMES as readonly string[]).includes(value ?? '');
}

function initialSettings(): Settings {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem(STORAGE_KEYS.openLinkInNewTab) === 'true',
    theme: isTheme(savedTheme) ? savedTheme : darkSchemeMedia()?.matches ? 'night' : 'default',
    titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) || '16',
    listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) || '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  const setTheme = useCallback((theme: Theme) => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    setSettings((s) => ({ ...s, theme }));
  }, []);

  useEffect(() => {
    // Like the Angular service: with no saved theme, the system scheme is applied and persisted.
    if (!isTheme(localStorage.getItem(STORAGE_KEYS.theme))) {
      localStorage.setItem(STORAGE_KEYS.theme, settings.theme);
    }
    const media = darkSchemeMedia();
    if (!media) return;
    const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [setTheme]);

  const toggleSettings = useCallback(() => setSettings((s) => ({ ...s, showSettings: !s.showSettings })), []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((s) => {
      const openLinkInNewTab = !s.openLinkInNewTab;
      localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
      return { ...s, openLinkInNewTab };
    });
  }, []);

  const setFont = useCallback((titleFontSize: string) => {
    localStorage.setItem(STORAGE_KEYS.titleFontSize, titleFontSize);
    setSettings((s) => ({ ...s, titleFontSize }));
  }, []);

  const setSpacing = useCallback((listSpacing: string) => {
    localStorage.setItem(STORAGE_KEYS.listSpacing, listSpacing);
    setSettings((s) => ({ ...s, listSpacing }));
  }, []);

  const value = useMemo(
    () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
