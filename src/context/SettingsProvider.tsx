import { ReactNode, useCallback, useEffect, useReducer } from 'react';
import { Settings } from '../models/settings';
import { SettingsContext } from './settings-context';

type Action =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_OPEN_LINKS' }
  | { type: 'SET_THEME'; theme: string }
  | { type: 'SET_FONT'; fontSize: string }
  | { type: 'SET_SPACING'; listSpacing: string };

function getInitialSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme: 'default',
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

function settingsReducer(state: Settings, action: Action): Settings {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'TOGGLE_OPEN_LINKS':
      return { ...state, openLinkInNewTab: !state.openLinkInNewTab };
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_FONT':
      return { ...state, titleFontSize: action.fontSize };
    case 'SET_SPACING':
      return { ...state, listSpacing: action.listSpacing };
    default:
      return state;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, undefined, getInitialSettings);

  const toggleSettings = useCallback(() => {
    dispatch({ type: 'TOGGLE_SETTINGS' });
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    dispatch({ type: 'TOGGLE_OPEN_LINKS' });
  }, []);

  // Persist openLinkInNewTab whenever the user toggles it.
  useEffect(() => {
    localStorage.setItem('openLinkInNewTab', JSON.stringify(settings.openLinkInNewTab));
  }, [settings.openLinkInNewTab]);

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    dispatch({ type: 'SET_THEME', theme });
  }, []);

  const setFont = useCallback((fontSize: string) => {
    localStorage.setItem('titleFontSize', fontSize);
    dispatch({ type: 'SET_FONT', fontSize });
  }, []);

  const setSpacing = useCallback((listSpacing: string) => {
    localStorage.setItem('listSpacing', listSpacing);
    dispatch({ type: 'SET_SPACING', listSpacing });
  }, []);

  // System preferred color scheme listener + initial theme resolution.
  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setTheme(event.matches ? 'night' : 'default');
    };

    darkColorSchemeMedia.addEventListener('change', handleChange);

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', theme: savedTheme });
    } else {
      handleChange(darkColorSchemeMedia);
    }

    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleChange);
    };
  }, [setTheme]);

  return (
    <SettingsContext.Provider
      value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
