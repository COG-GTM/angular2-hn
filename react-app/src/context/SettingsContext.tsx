import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings } from '../types/Settings';
import { SettingsContext } from './settingsContextDef';

function getInitialSettings(): Settings {
  const savedOpenLink = localStorage.getItem('openLinkInNewTab');
  const savedFontSize = localStorage.getItem('titleFontSize');
  const savedSpacing = localStorage.getItem('listSpacing');
  const savedTheme = localStorage.getItem('theme');

  let theme = 'default';
  if (savedTheme) {
    theme = savedTheme;
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = 'night';
  }

  return {
    showSettings: false,
    openLinkInNewTab: savedOpenLink ? JSON.parse(savedOpenLink) : false,
    theme,
    titleFontSize: savedFontSize ?? '16',
    listSpacing: savedSpacing ?? '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      const theme = event.matches ? 'night' : 'default';
      setSettings(prev => {
        localStorage.setItem('theme', theme);
        return { ...prev, theme };
      });
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings(prev => {
      const newVal = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
      return { ...prev, openLinkInNewTab: newVal };
    });
  }, []);

  const setTheme = useCallback((theme: string) => {
    setSettings(prev => {
      localStorage.setItem('theme', theme);
      return { ...prev, theme };
    });
  }, []);

  const setFont = useCallback((fontSize: string) => {
    setSettings(prev => {
      localStorage.setItem('titleFontSize', fontSize);
      return { ...prev, titleFontSize: fontSize };
    });
  }, []);

  const setSpacing = useCallback((listSpace: string) => {
    setSettings(prev => {
      localStorage.setItem('listSpacing', listSpace);
      return { ...prev, listSpacing: listSpace };
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
