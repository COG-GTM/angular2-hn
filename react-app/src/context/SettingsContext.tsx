import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings } from '../types';

// Default settings
const defaultSettings: Settings = {
  showSettings: false,
  openLinkInNewTab: false,
  theme: 'default',
  titleFontSize: '16',
  listSpacing: '0',
};

// Load settings from localStorage
function loadSettingsFromStorage(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const theme = localStorage.getItem('theme') as Settings['theme'] | null;
  const titleFontSize = localStorage.getItem('titleFontSize');
  const listSpacing = localStorage.getItem('listSpacing');

  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : defaultSettings.openLinkInNewTab,
    theme: theme || defaultSettings.theme,
    titleFontSize: titleFontSize || defaultSettings.titleFontSize,
    listSpacing: listSpacing || defaultSettings.listSpacing,
  };
}

// Context type
interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Settings['theme']) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider props
interface SettingsProviderProps {
  children: ReactNode;
}

// Settings Provider component
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(() => loadSettingsFromStorage());

  // Handle system preferred color scheme changes
  const handleSystemPreferredColorSchemeChange = useCallback((event: MediaQueryListEvent) => {
    // Only apply system preference if no theme is saved
    if (!localStorage.getItem('theme')) {
      const newTheme = event.matches ? 'night' : 'default';
      setSettings(prev => ({ ...prev, theme: newTheme }));
    }
  }, []);

  // Initialize theme based on system preference if no saved theme
  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Subscribe to system color scheme changes
    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

    // Initialize theme if not saved
    if (!localStorage.getItem('theme')) {
      const initialTheme = darkColorSchemeMedia.matches ? 'night' : 'default';
      setSettings(prev => ({ ...prev, theme: initialTheme }));
    }

    // Cleanup listener on unmount
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, [handleSystemPreferredColorSchemeChange]);

  // Toggle settings panel visibility
  const toggleSettings = useCallback(() => {
    setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  // Toggle open links in new tab setting
  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings(prev => {
      const newValue = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newValue));
      return { ...prev, openLinkInNewTab: newValue };
    });
  }, []);

  // Set theme
  const setTheme = useCallback((theme: Settings['theme']) => {
    localStorage.setItem('theme', theme);
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  // Set font size
  const setFont = useCallback((fontSize: string) => {
    localStorage.setItem('titleFontSize', fontSize);
    setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
  }, []);

  // Set list spacing
  const setSpacing = useCallback((listSpace: string) => {
    localStorage.setItem('listSpacing', listSpace);
    setSettings(prev => ({ ...prev, listSpacing: listSpace }));
  }, []);

  const value: SettingsContextType = {
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

// Custom hook to use settings context
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
