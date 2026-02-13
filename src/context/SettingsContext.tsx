import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: string;
  titleFontSize: string;
  listSpacing: string;
}

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (size: string) => void;
  setSpacing: (spacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function loadInitialSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
      ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
      : false,
    theme: 'default',
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(loadInitialSettings);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const setTheme = useCallback(
    (theme: string) => {
      updateSettings({ theme });
      localStorage.setItem('theme', theme);
    },
    [updateSettings],
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      updateSettings({ theme: savedTheme });
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'night' : 'default');
    }
  }, [setTheme, updateSettings]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'night' : 'default');
    };
    mediaQuery.addEventListener('change', handler);
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [setTheme]);

  const toggleSettings = useCallback(() => {
    updateSettings({ showSettings: !settings.showSettings });
  }, [settings.showSettings, updateSettings]);

  const toggleOpenLinksInNewTab = useCallback(() => {
    const next = !settings.openLinkInNewTab;
    updateSettings({ openLinkInNewTab: next });
    localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
  }, [settings.openLinkInNewTab, updateSettings]);

  const setFont = useCallback(
    (size: string) => {
      updateSettings({ titleFontSize: size });
      localStorage.setItem('titleFontSize', size);
    },
    [updateSettings],
  );

  const setSpacing = useCallback(
    (spacing: string) => {
      updateSettings({ listSpacing: spacing });
      localStorage.setItem('listSpacing', spacing);
    },
    [updateSettings],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      toggleSettings,
      toggleOpenLinksInNewTab,
      setTheme,
      setFont,
      setSpacing,
    }),
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (ctx === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}

export function useTheme(): {
  theme: string;
  setTheme: (theme: string) => void;
} {
  const { settings, setTheme } = useSettings();
  return useMemo(() => ({ theme: settings.theme, setTheme }), [settings.theme, setTheme]);
}
