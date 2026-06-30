import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { Settings } from '../models/settings';

type Action =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }
  | { type: 'SET_THEME'; theme: string }
  | { type: 'SET_FONT'; fontSize: string }
  | { type: 'SET_SPACING'; listSpacing: string };

function getInitialTheme(): string {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'night'
    : 'default';
}

function createInitialSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme: getInitialTheme(),
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

function reducer(state: Settings, action: Action): Settings {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'TOGGLE_OPEN_LINKS_IN_NEW_TAB': {
      const openLinkInNewTab = !state.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
      return { ...state, openLinkInNewTab };
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

export interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(
    reducer,
    undefined,
    createInitialSettings,
  );

  // Sync theme with the system preferred color scheme and persist it.
  // This matches the original SettingsService behavior.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      dispatch({
        type: 'SET_THEME',
        theme: event.matches ? 'night' : 'default',
      });
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      toggleSettings: () => dispatch({ type: 'TOGGLE_SETTINGS' }),
      toggleOpenLinksInNewTab: () =>
        dispatch({ type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }),
      setTheme: (theme: string) => dispatch({ type: 'SET_THEME', theme }),
      setFont: (fontSize: string) => dispatch({ type: 'SET_FONT', fontSize }),
      setSpacing: (listSpacing: string) =>
        dispatch({ type: 'SET_SPACING', listSpacing }),
    }),
    [settings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
