import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SettingsContext } from './context';
import { DARK_SCHEME_QUERY, STORAGE_KEYS, type Settings, type Theme } from './settings';

function systemTheme(): Theme {
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'night' : 'default';
}

/** Mirrors the Angular SettingsService: a saved theme wins, otherwise the system scheme is applied and saved. */
function initialSettings(): Settings {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) as Theme | null;
  const theme = savedTheme ?? systemTheme();
  if (!savedTheme) localStorage.setItem(STORAGE_KEYS.theme, theme);
  const openLinkInNewTab = localStorage.getItem(STORAGE_KEYS.openLinkInNewTab);
  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme,
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
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
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
    () => ({ ...settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
