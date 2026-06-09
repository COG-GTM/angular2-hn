import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Settings } from '../types/settings';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function getInitialSettings(): Settings {
  const storedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const storedTitleFontSize = localStorage.getItem('titleFontSize');
  const storedListSpacing = localStorage.getItem('listSpacing');
  const storedTheme = localStorage.getItem('theme');

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return {
    showSettings: false,
    openLinkInNewTab: storedOpenLinkInNewTab
      ? JSON.parse(storedOpenLinkInNewTab)
      : false,
    theme: storedTheme ? storedTheme : prefersDark ? 'night' : 'default',
    titleFontSize: storedTitleFontSize ? storedTitleFontSize : '16',
    listSpacing: storedListSpacing ? storedListSpacing : '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  const setTheme = useCallback((theme: string) => {
    setSettings((prev) => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  // Replicate the Angular service's `prefers-color-scheme: dark` listener.
  // Only react to system changes when the user hasn't explicitly saved a theme.
  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia(
      '(prefers-color-scheme: dark)',
    );

    const handleChange = (event: MediaQueryListEvent) => {
      if (localStorage.getItem('theme')) {
        return;
      }
      setSettings((prev) => ({
        ...prev,
        theme: event.matches ? 'night' : 'default',
      }));
    };

    darkColorSchemeMedia.addEventListener('change', handleChange);
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleChange);
    };
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

  const setSpacing = useCallback((listSpace: string) => {
    setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
    localStorage.setItem('listSpacing', listSpace);
  }, []);

  const value: SettingsContextValue = {
    settings,
    toggleSettings,
    toggleOpenLinksInNewTab,
    setTheme,
    setFont,
    setSpacing,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
