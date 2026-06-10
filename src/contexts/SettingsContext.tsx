import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Settings } from '../models/settings';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function getInitialSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const titleFontSize = localStorage.getItem('titleFontSize');
  const listSpacing = localStorage.getItem('listSpacing');
  const savedTheme = localStorage.getItem('theme');

  let theme = 'default';
  if (savedTheme) {
    theme = savedTheme;
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = 'night';
  }

  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme,
    titleFontSize: titleFontSize ? titleFontSize : '16',
    listSpacing: listSpacing ? listSpacing : '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'night' : 'default');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [setTheme]);

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
    localStorage.setItem('titleFontSize', fontSize);
    setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
  }, []);

  const setSpacing = useCallback((listSpacing: string) => {
    localStorage.setItem('listSpacing', listSpacing);
    setSettings((prev) => ({ ...prev, listSpacing }));
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
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
