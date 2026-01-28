import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type { Settings } from '../models/settings';

type Theme = 'default' | 'night' | 'amoledblack';

interface SettingsContextValue extends Settings {
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Theme) => void;
  setTitleFontSize: (fontSize: string) => void;
  setListSpacing: (spacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  OPEN_LINK_IN_NEW_TAB: 'openLinkInNewTab',
  THEME: 'theme',
  TITLE_FONT_SIZE: 'titleFontSize',
  LIST_SPACING: 'listSpacing',
} as const;

function getStoredBoolean(key: string, defaultValue: boolean): boolean {
  const stored = localStorage.getItem(key);
  if (stored !== null) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

function getStoredString(key: string, defaultValue: string): string {
  return localStorage.getItem(key) ?? defaultValue;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [openLinkInNewTab, setOpenLinkInNewTab] = useState(() =>
    getStoredBoolean(STORAGE_KEYS.OPEN_LINK_IN_NEW_TAB, false)
  );
  const [theme, setThemeState] = useState<Theme>('default');
  const [titleFontSize, setTitleFontSizeState] = useState(() =>
    getStoredString(STORAGE_KEYS.TITLE_FONT_SIZE, '16')
  );
  const [listSpacing, setListSpacingState] = useState(() =>
    getStoredString(STORAGE_KEYS.LIST_SPACING, '0')
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) {
      setThemeState(savedTheme as Theme);
    } else {
      const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (darkColorSchemeMedia.matches) {
        setThemeState('night');
      } else {
        setThemeState('default');
      }
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) {
      return;
    }

    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      const currentSavedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (!currentSavedTheme) {
        setThemeState(event.matches ? 'night' : 'default');
      }
    };

    darkColorSchemeMedia.addEventListener('change', handleChange);

    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleChange);
    };
  }, []);

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setOpenLinkInNewTab((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEYS.OPEN_LINK_IN_NEW_TAB, JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  }, []);

  const setTitleFontSize = useCallback((fontSize: string) => {
    setTitleFontSizeState(fontSize);
    localStorage.setItem(STORAGE_KEYS.TITLE_FONT_SIZE, fontSize);
  }, []);

  const setListSpacing = useCallback((spacing: string) => {
    setListSpacingState(spacing);
    localStorage.setItem(STORAGE_KEYS.LIST_SPACING, spacing);
  }, []);

  const value: SettingsContextValue = {
    showSettings,
    openLinkInNewTab,
    theme,
    titleFontSize,
    listSpacing,
    toggleSettings,
    toggleOpenLinksInNewTab,
    setTheme,
    setTitleFontSize,
    setListSpacing,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
