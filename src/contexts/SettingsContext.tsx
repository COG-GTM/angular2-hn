import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Settings } from '../types/settings';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (spacing: string) => void;
  toggleOpenLinksInNewTab: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

type SettingsAction =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'SET_FONT'; payload: string }
  | { type: 'SET_SPACING'; payload: string }
  | { type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' };

const initialSettings: Settings = {
  showSettings: false,
  openLinkInNewTab: localStorage.getItem("openLinkInNewTab") ? JSON.parse(localStorage.getItem("openLinkInNewTab")!) : false,
  theme: localStorage.getItem("theme") || 'default',
  titleFontSize: localStorage.getItem("titleFontSize") || '16',
  listSpacing: localStorage.getItem("listSpacing") || '0',
};

const settingsReducer = (state: Settings, action: SettingsAction): Settings => {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'SET_THEME':
      localStorage.setItem("theme", action.payload);
      return { ...state, theme: action.payload };
    case 'SET_FONT':
      localStorage.setItem("titleFontSize", action.payload);
      return { ...state, titleFontSize: action.payload };
    case 'SET_SPACING':
      localStorage.setItem("listSpacing", action.payload);
      return { ...state, listSpacing: action.payload };
    case 'TOGGLE_OPEN_LINKS_IN_NEW_TAB':
      const newValue = !state.openLinkInNewTab;
      localStorage.setItem("openLinkInNewTab", JSON.stringify(newValue));
      return { ...state, openLinkInNewTab: newValue };
    default:
      return state;
  }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
      const theme = event.matches ? 'night' : 'default';
      dispatch({ type: 'SET_THEME', payload: theme });
    };

    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
      const theme = darkColorSchemeMedia.matches ? 'night' : 'default';
      dispatch({ type: 'SET_THEME', payload: theme });
    }

    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
    
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, []);

  const toggleSettings = () => {
    dispatch({ type: 'TOGGLE_SETTINGS' });
  };

  const setTheme = (theme: string) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setFont = (fontSize: string) => {
    dispatch({ type: 'SET_FONT', payload: fontSize });
  };

  const setSpacing = (spacing: string) => {
    dispatch({ type: 'SET_SPACING', payload: spacing });
  };

  const toggleOpenLinksInNewTab = () => {
    dispatch({ type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' });
  };

  const contextValue: SettingsContextType = {
    settings,
    toggleSettings,
    setTheme,
    setFont,
    setSpacing,
    toggleOpenLinksInNewTab,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
