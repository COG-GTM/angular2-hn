import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { Settings } from '../models/Settings';

type SettingsAction =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }
  | { type: 'SET_THEME'; theme: string }
  | { type: 'SET_FONT'; fontSize: string }
  | { type: 'SET_SPACING'; listSpacing: string };

function getInitialTheme(): string {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'night';
  return 'default';
}

function getInitialSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
      ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
      : false,
    theme: getInitialTheme(),
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0',
  };
}

function settingsReducer(state: Settings, action: SettingsAction): Settings {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'TOGGLE_OPEN_LINKS_IN_NEW_TAB': {
      const next = !state.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
      return { ...state, openLinkInNewTab: next };
    }
    case 'SET_THEME':
      localStorage.setItem('theme', action.theme);
      return { ...state, theme: action.theme };
    case 'SET_FONT':
      localStorage.setItem('titleFontSize', action.fontSize);
      return { ...state, titleFontSize: action.fontSize };
    case 'SET_SPACING':
      localStorage.setItem('listSpacing', action.listSpacing);
      return { ...state, listSpacing: action.listSpacing };
    default:
      return state;
  }
}

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, undefined, getInitialSettings);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        dispatch({ type: 'SET_THEME', theme: e.matches ? 'night' : 'default' });
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const value: SettingsContextValue = {
    settings,
    toggleSettings: () => dispatch({ type: 'TOGGLE_SETTINGS' }),
    toggleOpenLinksInNewTab: () => dispatch({ type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }),
    setTheme: (theme: string) => dispatch({ type: 'SET_THEME', theme }),
    setFont: (fontSize: string) => dispatch({ type: 'SET_FONT', fontSize }),
    setSpacing: (listSpacing: string) => dispatch({ type: 'SET_SPACING', listSpacing }),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
