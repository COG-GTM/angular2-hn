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

function isFirstVisit(): boolean {
  try {
    return !localStorage.getItem('hn-settings');
  } catch {
    return true;
  }
}

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem('hn-settings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved), showSettings: false };
    }
  } catch {
    // ignore
  }

  // On first visit, check system dark mode preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return { ...defaultSettings, theme: 'night' };
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
    const { showSettings: _, ...persistable } = settings;
    saveSettings({ ...persistable, showSettings: false } as Settings);
  }, [settings]);

  // Listen to system dark mode preference changes
  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        dispatch({ type: 'SET_THEME', theme: 'night' });
      } else {
        dispatch({ type: 'SET_THEME', theme: 'default' });
      }
    };

    darkColorSchemeMedia.addEventListener('change', handleChange);

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
