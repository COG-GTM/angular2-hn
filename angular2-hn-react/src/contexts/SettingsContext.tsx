import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Settings } from '../types';

type SettingsAction =
  | { type: 'LOAD_SETTINGS'; payload: Partial<Settings> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }
  | { type: 'SET_THEME'; payload: Settings['theme'] }
  | { type: 'SET_FONT_SIZE'; payload: string }
  | { type: 'SET_SPACING'; payload: string };

const getDefaultSettings = (): Settings => ({
  showSettings: false,
  openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
    ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
    : false,
  theme: 'default',
  titleFontSize: localStorage.getItem('titleFontSize') || '16',
  listSpacing: localStorage.getItem('listSpacing') || '0',
});

const settingsReducer = (state: Settings, action: SettingsAction): Settings => {
  switch (action.type) {
    case 'LOAD_SETTINGS':
      return { ...state, ...action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, ...action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'TOGGLE_OPEN_LINKS_IN_NEW_TAB':
      const newOpenLinkInNewTab = !state.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newOpenLinkInNewTab));
      return { ...state, openLinkInNewTab: newOpenLinkInNewTab };
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };
    case 'SET_FONT_SIZE':
      localStorage.setItem('titleFontSize', action.payload);
      return { ...state, titleFontSize: action.payload };
    case 'SET_SPACING':
      localStorage.setItem('listSpacing', action.payload);
      return { ...state, listSpacing: action.payload };
    default:
      return state;
  }
};

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Settings['theme']) => void;
  setFontSize: (fontSize: string) => void;
  setSpacing: (spacing: string) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, dispatch] = useReducer(settingsReducer, getDefaultSettings());

  const handleSystemPreferredColorSchemeChange = useCallback((event: MediaQueryListEvent | MediaQueryList) => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const theme = event.matches ? 'night' : 'default';
      dispatch({ type: 'SET_THEME', payload: theme });
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Settings['theme'] | null;
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    } else {
      const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
      handleSystemPreferredColorSchemeChange(darkColorSchemeMedia);
    }
  }, [handleSystemPreferredColorSchemeChange]);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        handleSystemPreferredColorSchemeChange(event);
      }
    };
    darkColorSchemeMedia.addEventListener('change', handler);
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handler);
    };
  }, [handleSystemPreferredColorSchemeChange]);

  const toggleSettings = useCallback(() => {
    dispatch({ type: 'TOGGLE_SETTINGS' });
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    dispatch({ type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' });
  }, []);

  const setTheme = useCallback((theme: Settings['theme']) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const setFontSize = useCallback((fontSize: string) => {
    dispatch({ type: 'SET_FONT_SIZE', payload: fontSize });
  }, []);

  const setSpacing = useCallback((spacing: string) => {
    dispatch({ type: 'SET_SPACING', payload: spacing });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFontSize,
        setSpacing,
      }}
    >
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
