import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../components/shared/models';

const DEFAULT_SETTINGS: Settings = {
  showSettings: false,
  openLinkInNewTab: false,
  theme: 'default',
  titleFontSize: '16',
  listSpacing: '0',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = { ...DEFAULT_SETTINGS };
    
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    if (openLinkInNewTab) {
      savedSettings.openLinkInNewTab = JSON.parse(openLinkInNewTab);
    }
    
    const titleFontSize = localStorage.getItem('titleFontSize');
    if (titleFontSize) {
      savedSettings.titleFontSize = titleFontSize;
    }
    
    const listSpacing = localStorage.getItem('listSpacing');
    if (listSpacing) {
      savedSettings.listSpacing = listSpacing;
    }
    
    const theme = localStorage.getItem('theme');
    if (theme) {
      savedSettings.theme = theme;
    }
    
    return savedSettings;
  });

  const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  const handleSystemPreferredColorSchemeChange = useCallback((event: MediaQueryListEvent) => {
    const theme = event.matches ? 'night' : 'default';
    setTheme(theme);
  }, []);

  useEffect(() => {
    const initTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const systemPrefersDark = darkColorSchemeMedia.matches;
        const theme = systemPrefersDark ? 'night' : 'default';
        setTheme(theme);
      }
    };

    initTheme();
    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, [handleSystemPreferredColorSchemeChange]);

  const toggleSettings = useCallback(() => {
    setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings(prev => {
      const newValue = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newValue));
      return { ...prev, openLinkInNewTab: newValue };
    });
  }, []);

  const setTheme = useCallback((theme: string) => {
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  }, []);

  const setFont = useCallback((fontSize: string) => {
    setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
    localStorage.setItem('titleFontSize', fontSize);
  }, []);

  const setSpacing = useCallback((listSpace: string) => {
    setSettings(prev => ({ ...prev, listSpacing: listSpace }));
    localStorage.setItem('listSpacing', listSpace);
  }, []);

  return {
    settings,
    toggleSettings,
    toggleOpenLinksInNewTab,
    setTheme,
    setFont,
    setSpacing,
  };
};
