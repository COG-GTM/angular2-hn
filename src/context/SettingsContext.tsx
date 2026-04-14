import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { Settings } from '../types/settings';

type SettingsAction =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }
  | { type: 'SET_THEME'; theme: string }
  | { type: 'SET_FONT'; size: number }
  | { type: 'SET_SPACING'; spacing: number };

const defaultSettings: Settings = {
  showSettings: false,
  openLinkInNewTab: false,
  theme: 'default',
  titleFontSize: 16,
  listSpacing: 0,
};

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem('hn-settings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return defaultSettings;
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem('hn-settings', JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function settingsReducer(state: Settings, action: SettingsAction): Settings {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'TOGGLE_OPEN_LINKS_IN_NEW_TAB':
      return { ...state, openLinkInNewTab: !state.openLinkInNewTab };
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_FONT':
      return { ...state, titleFontSize: action.size };
    case 'SET_SPACING':
      return { ...state, listSpacing: action.spacing };
    default:
      return state;
  }
}

interface SettingsContextValue {
  settings: Settings;
  dispatch: React.Dispatch<SettingsAction>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, undefined, loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Listen to system dark mode preference
  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        dispatch({ type: 'SET_THEME', theme: 'night' });
      }
    };

    darkColorSchemeMedia.addEventListener('change', handleChange);

    // Check initial preference if no saved theme
    const saved = localStorage.getItem('hn-settings');
    if (!saved && darkColorSchemeMedia.matches) {
      dispatch({ type: 'SET_THEME', theme: 'night' });
    }

    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
