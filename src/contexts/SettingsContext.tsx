import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { Settings } from '@/types';

type SettingsAction =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }
  | { type: 'SET_THEME'; theme: string }
  | { type: 'SET_FONT_SIZE'; fontSize: string }
  | { type: 'SET_SPACING'; spacing: string };

function loadSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') ?? 'false') as boolean,
    theme: localStorage.getItem('theme') ?? 'default',
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

function settingsReducer(state: Settings, action: SettingsAction): Settings {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'TOGGLE_OPEN_LINKS_IN_NEW_TAB': {
      const newVal = !state.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
      return { ...state, openLinkInNewTab: newVal };
    }
    case 'SET_THEME':
      localStorage.setItem('theme', action.theme);
      return { ...state, theme: action.theme };
    case 'SET_FONT_SIZE':
      localStorage.setItem('titleFontSize', action.fontSize);
      return { ...state, titleFontSize: action.fontSize };
    case 'SET_SPACING':
      localStorage.setItem('listSpacing', action.spacing);
      return { ...state, listSpacing: action.spacing };
  }
}

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: string) => void;
  setSpacing: (spacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, undefined, loadSettings);

  // Detect system preferred color scheme
  useEffect(() => {
    if (settings.theme) return; // User already has a saved theme

    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const applySystemTheme = (matches: boolean) => {
      dispatch({ type: 'SET_THEME', theme: matches ? 'night' : 'default' });
    };

    applySystemTheme(mql.matches);

    const handler = (e: MediaQueryListEvent) => applySystemTheme(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSettings = useCallback(() => dispatch({ type: 'TOGGLE_SETTINGS' }), []);
  const toggleOpenLinksInNewTab = useCallback(
    () => dispatch({ type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }),
    []
  );
  const setTheme = useCallback((theme: string) => dispatch({ type: 'SET_THEME', theme }), []);
  const setFontSize = useCallback(
    (fontSize: string) => dispatch({ type: 'SET_FONT_SIZE', fontSize }),
    []
  );
  const setSpacing = useCallback(
    (spacing: string) => dispatch({ type: 'SET_SPACING', spacing }),
    []
  );

  const value = useMemo(
    () => ({
      settings,
      toggleSettings,
      toggleOpenLinksInNewTab,
      setTheme,
      setFontSize,
      setSpacing,
    }),
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFontSize, setSpacing]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
