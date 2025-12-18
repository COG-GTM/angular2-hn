import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings } from '../types';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Settings['theme']) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function getInitialSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const theme = localStorage.getItem('theme') as Settings['theme'] | null;
  const titleFontSize = localStorage.getItem('titleFontSize');
  const listSpacing = localStorage.getItem('listSpacing');

  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme: theme || 'default',
    titleFontSize: titleFontSize || '16',
    listSpacing: listSpacing || '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const newTheme = event.matches ? 'night' : 'default';
        setSettings((prev) => ({ ...prev, theme: newTheme }));
      }
    };

    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const initialTheme = darkColorSchemeMedia.matches ? 'night' : 'default';
      setSettings((prev) => ({ ...prev, theme: initialTheme }));
    }

    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((prev) => {
      const newValue = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newValue));
      return { ...prev, openLinkInNewTab: newValue };
    });
  }, []);

  const setTheme = useCallback((theme: Settings['theme']) => {
    localStorage.setItem('theme', theme);
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const setFont = useCallback((fontSize: string) => {
    localStorage.setItem('titleFontSize', fontSize);
    setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
  }, []);

  const setSpacing = useCallback((listSpacing: string) => {
    localStorage.setItem('listSpacing', listSpacing);
    setSettings((prev) => ({ ...prev, listSpacing }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
