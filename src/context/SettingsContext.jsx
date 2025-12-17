import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    
    let initialTheme = savedTheme;
    if (!savedTheme) {
      initialTheme = darkColorSchemeMedia.matches ? 'night' : 'default';
    }

    return {
      showSettings: false,
      openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') || 'false'),
      theme: initialTheme,
      titleFontSize: localStorage.getItem('titleFontSize') || '16',
      listSpacing: localStorage.getItem('listSpacing') || '0',
    };
  });

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemPreferredColorSchemeChange = (event) => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const theme = event.matches ? 'night' : 'default';
        setSettings(prev => ({ ...prev, theme }));
      }
    };

    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
    
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    localStorage.setItem('openLinkInNewTab', JSON.stringify(settings.openLinkInNewTab));
  }, [settings.openLinkInNewTab]);

  useEffect(() => {
    localStorage.setItem('titleFontSize', settings.titleFontSize);
  }, [settings.titleFontSize]);

  useEffect(() => {
    localStorage.setItem('listSpacing', settings.listSpacing);
  }, [settings.listSpacing]);

  const toggleSettings = useCallback(() => {
    setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings(prev => ({ ...prev, openLinkInNewTab: !prev.openLinkInNewTab }));
  }, []);

  const setTheme = useCallback((theme) => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setFont = useCallback((fontSize) => {
    setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
  }, []);

  const setSpacing = useCallback((listSpacing) => {
    setSettings(prev => ({ ...prev, listSpacing }));
  }, []);

  const value = {
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

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
