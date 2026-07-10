import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Settings } from '../types/settings';

interface SettingsContextValue {
  settings: Settings;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
  toggleOpenLinksInNewTab: () => void;
  toggleSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

function readInitialSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme: 'default',
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(readInitialSettings);

  const setTheme = useCallback((theme: string) => {
    setSettings((prev) => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  const setFont = useCallback((fontSize: string) => {
    setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
    localStorage.setItem('titleFontSize', fontSize);
  }, []);

  const setSpacing = useCallback((listSpace: string) => {
    setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
    localStorage.setItem('listSpacing', listSpace);
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((prev) => {
      const openLinkInNewTab = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
      return { ...prev, openLinkInNewTab };
    });
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  // Mirror SettingsService: subscribe to the prefers-color-scheme media query,
  // auto-switch between 'default'/'night', initialise from a saved theme, and
  // clean up the listener on unmount.
  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia(
      '(prefers-color-scheme: dark)',
    );

    const handleSystemPreferredColorSchemeChange = (
      event: MediaQueryListEvent,
    ) => {
      setTheme(event.matches ? 'night' : 'default');
    };

    darkColorSchemeMedia.addEventListener(
      'change',
      handleSystemPreferredColorSchemeChange,
    );

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setSettings((prev) => ({ ...prev, theme: savedTheme }));
    } else {
      handleSystemPreferredColorSchemeChange(
        new MediaQueryListEvent('change', {
          media: darkColorSchemeMedia.media,
          matches: darkColorSchemeMedia.matches,
        }),
      );
    }

    return () => {
      darkColorSchemeMedia.removeEventListener(
        'change',
        handleSystemPreferredColorSchemeChange,
      );
    };
  }, [setTheme]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setTheme,
      setFont,
      setSpacing,
      toggleOpenLinksInNewTab,
      toggleSettings,
    }),
    [
      settings,
      setTheme,
      setFont,
      setSpacing,
      toggleOpenLinksInNewTab,
      toggleSettings,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
