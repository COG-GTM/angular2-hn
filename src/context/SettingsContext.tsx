import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings } from '../models';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const defaultSettings: Settings = {
  showSettings: false,
  openLinkInNewTab: false,
  theme: 'default',
  titleFontSize: '16',
  listSpacing: '0',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const titleFontSize = localStorage.getItem('titleFontSize');
    const listSpacing = localStorage.getItem('listSpacing');

    return {
      ...defaultSettings,
      openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
      titleFontSize: titleFontSize || '16',
      listSpacing: listSpacing || '0',
    };
  });

  const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  const handleSystemPreferredColorSchemeChange = useCallback((event: MediaQueryListEvent | MediaQueryList) => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const theme = event.matches ? 'night' : 'default';
      setSettings((prev) => ({ ...prev, theme }));
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setSettings((prev) => ({ ...prev, theme: savedTheme }));
    } else {
      handleSystemPreferredColorSchemeChange(darkColorSchemeMedia);
    }

    const handler = (event: MediaQueryListEvent) => {
      handleSystemPreferredColorSchemeChange(event);
    };

    darkColorSchemeMedia.addEventListener('change', handler);
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handler);
    };
  }, [handleSystemPreferredColorSchemeChange]);

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

  const setTheme = useCallback((theme: string) => {
    setSettings((prev) => {
      localStorage.setItem('theme', theme);
      return { ...prev, theme };
    });
  }, []);

  const setFont = useCallback((fontSize: string) => {
    setSettings((prev) => {
      localStorage.setItem('titleFontSize', fontSize);
      return { ...prev, titleFontSize: fontSize };
    });
  }, []);

  const setSpacing = useCallback((listSpace: string) => {
    setSettings((prev) => {
      localStorage.setItem('listSpacing', listSpace);
      return { ...prev, listSpacing: listSpace };
    });
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
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
