import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Settings } from '../types';

interface SettingsState extends Settings {}

type SettingsAction =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'SET_FONT_SIZE'; payload: string }
  | { type: 'SET_SPACING'; payload: string }
  | { type: 'INIT_SETTINGS'; payload: Partial<Settings> };

interface SettingsContextType {
  settings: SettingsState;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function getStoredValue(key: string, defaultValue: any) {
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;
  
  try {
    return JSON.parse(stored);
  } catch {
    return stored;
  }
}

const initialSettings: SettingsState = {
  showSettings: false,
  openLinkInNewTab: getStoredValue('openLinkInNewTab', false),
  theme: 'default',
  titleFontSize: getStoredValue('titleFontSize', '16'),
  listSpacing: getStoredValue('listSpacing', '0'),
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    
    case 'TOGGLE_OPEN_LINKS_IN_NEW_TAB':
      const newOpenLinkValue = !state.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newOpenLinkValue));
      return { ...state, openLinkInNewTab: newOpenLinkValue };
    
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };
    
    case 'SET_FONT_SIZE':
      localStorage.setItem('titleFontSize', action.payload);
      return { ...state, titleFontSize: action.payload };
    
    case 'SET_SPACING':
      localStorage.setItem('listSpacing', action.payload);
      return { ...state, listSpacing: action.payload };
    
    case 'INIT_SETTINGS':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

  const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
    const theme = event.matches ? 'night' : 'default';
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    } else {
      const systemPrefersDark = darkColorSchemeMedia.matches;
      const theme = systemPrefersDark ? 'night' : 'default';
      dispatch({ type: 'SET_THEME', payload: theme });
    }
  };

  useEffect(() => {
    initTheme();
    
    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
    
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, []);

  const toggleSettings = () => dispatch({ type: 'TOGGLE_SETTINGS' });
  const toggleOpenLinksInNewTab = () => dispatch({ type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' });
  const setTheme = (theme: string) => dispatch({ type: 'SET_THEME', payload: theme });
  const setFont = (fontSize: string) => dispatch({ type: 'SET_FONT_SIZE', payload: fontSize });
  const setSpacing = (listSpace: string) => dispatch({ type: 'SET_SPACING', payload: listSpace });

  const contextValue: SettingsContextType = {
    settings,
    toggleSettings,
    toggleOpenLinksInNewTab,
    setTheme,
    setFont,
    setSpacing,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
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
