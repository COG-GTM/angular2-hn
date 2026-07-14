import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

// Port of src/app/shared/models/settings.ts + src/app/shared/services/settings.service.ts.
export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: string;
  titleFontSize: string;
  listSpacing: string;
}

export interface SettingsContextValue extends Settings {
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function getInitialSettings(): Settings {
  const savedOpenLink = localStorage.getItem('openLinkInNewTab');
  const savedTheme = localStorage.getItem('theme');
  const savedFontSize = localStorage.getItem('titleFontSize');
  const savedSpacing = localStorage.getItem('listSpacing');

  const theme = savedTheme
    ? savedTheme
    : window.matchMedia(DARK_SCHEME_QUERY).matches
      ? 'night'
      : 'default';

  return {
    showSettings: false,
    openLinkInNewTab: savedOpenLink ? JSON.parse(savedOpenLink) : false,
    theme,
    titleFontSize: savedFontSize ? savedFontSize : '16',
    listSpacing: savedSpacing ? savedSpacing : '0',
  };
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  const setTheme = useCallback((theme: string) => {
    setSettings((prev) => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((prev) => {
      const openLinkInNewTab = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
      return { ...prev, openLinkInNewTab };
    });
  }, []);

  const setFont = useCallback((fontSize: string) => {
    setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
    localStorage.setItem('titleFontSize', fontSize);
  }, []);

  const setSpacing = useCallback((listSpacing: string) => {
    setSettings((prev) => ({ ...prev, listSpacing }));
    localStorage.setItem('listSpacing', listSpacing);
  }, []);

  // Derive theme from the system preference when none is saved, and keep it in
  // sync with system changes (parity with SettingsService.initTheme + subscribe).
  useEffect(() => {
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    if (!localStorage.getItem('theme')) {
      setTheme(media.matches ? 'night' : 'default');
    }
    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'night' : 'default');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [setTheme]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
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
