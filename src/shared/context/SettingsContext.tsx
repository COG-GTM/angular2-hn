import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Settings } from '../types';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function getInitialTheme(): string {
  let savedTheme = localStorage.getItem('theme');
  // Backward-compat: the Angular app persisted the AMOLED theme as 'amoledblack',
  // but the ported CSS class is '.amoled'. Migrate existing users' stored value.
  if (savedTheme === 'amoledblack') {
    savedTheme = 'amoled';
    localStorage.setItem('theme', savedTheme);
  }
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches ? 'night' : 'default';
}

function getInitialSettings(): Settings {
  const storedOpenLink = localStorage.getItem('openLinkInNewTab');
  return {
    showSettings: false,
    openLinkInNewTab: storedOpenLink ? (JSON.parse(storedOpenLink) as boolean) : false,
    theme: getInitialTheme(),
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia(DARK_COLOR_SCHEME_QUERY);

    const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
      const theme = event.matches ? 'night' : 'default';
      localStorage.setItem('theme', theme);
      setSettings((prev) => ({ ...prev, theme }));
    };

    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, []);

  const toggleSettings = () => {
    setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  };

  const toggleOpenLinksInNewTab = () => {
    setSettings((prev) => {
      const openLinkInNewTab = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
      return { ...prev, openLinkInNewTab };
    });
  };

  const setTheme = (theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((prev) => ({ ...prev, theme }));
  };

  const setFont = (fontSize: string) => {
    localStorage.setItem('titleFontSize', fontSize);
    setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
  };

  const setSpacing = (listSpace: string) => {
    localStorage.setItem('listSpacing', listSpace);
    setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
  };

  const value: SettingsContextValue = {
    settings,
    toggleSettings,
    toggleOpenLinksInNewTab,
    setTheme,
    setFont,
    setSpacing,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
