// Port of src/app/shared/services/settings.service.ts.
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SettingsContext } from './SettingsContext';
import { DEFAULT_SETTINGS, type Settings, type SettingsApi, type Theme } from './types';

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function getDarkColorSchemeMedia(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia(DARK_COLOR_SCHEME_QUERY) : null;
}

function themeForColorScheme(prefersDark: boolean): Theme {
  return prefersDark ? 'night' : 'default';
}

function readOpenLinkInNewTab(): boolean {
  const saved = localStorage.getItem('openLinkInNewTab');
  if (!saved) return DEFAULT_SETTINGS.openLinkInNewTab;
  try {
    return Boolean(JSON.parse(saved));
  } catch {
    return DEFAULT_SETTINGS.openLinkInNewTab;
  }
}

function readInitialSettings(): Settings {
  const savedTheme = localStorage.getItem('theme');
  return {
    showSettings: false,
    openLinkInNewTab: readOpenLinkInNewTab(),
    theme: savedTheme
      ? (savedTheme as Theme)
      : themeForColorScheme(getDarkColorSchemeMedia()?.matches ?? false),
    titleFontSize: localStorage.getItem('titleFontSize') || DEFAULT_SETTINGS.titleFontSize,
    listSpacing: localStorage.getItem('listSpacing') || DEFAULT_SETTINGS.listSpacing,
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(readInitialSettings);

  const setTheme = useCallback((theme: Theme) => {
    setSettings((s) => ({ ...s, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  useEffect(() => {
    const media = getDarkColorSchemeMedia();
    // With no saved theme, SettingsService applies (and persists) the system color scheme on startup.
    if (!localStorage.getItem('theme')) {
      setTheme(themeForColorScheme(media?.matches ?? false));
    }
    if (!media) return;
    const onChange = (event: MediaQueryListEvent) => setTheme(themeForColorScheme(event.matches));
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [setTheme]);

  const api = useMemo<SettingsApi>(
    () => ({
      settings,
      toggleSettings: () => setSettings((s) => ({ ...s, showSettings: !s.showSettings })),
      toggleOpenLinksInNewTab: () =>
        setSettings((s) => {
          const openLinkInNewTab = !s.openLinkInNewTab;
          localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
          return { ...s, openLinkInNewTab };
        }),
      setTheme,
      setFont: (titleFontSize) => {
        setSettings((s) => ({ ...s, titleFontSize }));
        localStorage.setItem('titleFontSize', titleFontSize);
      },
      setSpacing: (listSpacing) => {
        setSettings((s) => ({ ...s, listSpacing }));
        localStorage.setItem('listSpacing', listSpacing);
      },
    }),
    [settings, setTheme],
  );

  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>;
}
