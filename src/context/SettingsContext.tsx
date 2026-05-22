import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { Settings } from '../types/settings';

type SettingsAction =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_OPEN_LINKS_NEW_TAB' }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'SET_FONT'; payload: string }
  | { type: 'SET_SPACING'; payload: string };

function getInitialSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') ?? 'false'),
    theme: localStorage.getItem('theme') ?? 'default',
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

function settingsReducer(state: Settings, action: SettingsAction): Settings {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'TOGGLE_OPEN_LINKS_NEW_TAB': {
      const newVal = !state.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
      return { ...state, openLinkInNewTab: newVal };
    }
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };
    case 'SET_FONT':
      localStorage.setItem('titleFontSize', action.payload);
      return { ...state, titleFontSize: action.payload };
    case 'SET_SPACING':
      localStorage.setItem('listSpacing', action.payload);
      return { ...state, listSpacing: action.payload };
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
  const [settings, dispatch] = useReducer(settingsReducer, undefined, getInitialSettings);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      dispatch({ type: 'SET_THEME', payload: mq.matches ? 'night' : 'default' });
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      dispatch({ type: 'SET_THEME', payload: e.matches ? 'night' : 'default' });
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
