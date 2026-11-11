import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Settings, Theme } from '../models';

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Theme) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (spacing: string) => void;
}
const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);
const mediaQuery = '(prefers-color-scheme: dark)';
function savedTheme(): Theme | null {
  const value = localStorage.getItem('theme');
  if (value === 'amoledblack') return 'amoled';
  return value === 'default' || value === 'night' || value === 'amoled' ? value : null;
}
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({
    showSettings: false,
    openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') || 'false') as boolean,
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0',
    theme: savedTheme() || (window.matchMedia(mediaQuery).matches ? 'night' : 'default'),
  }));
  useEffect(() => {
    const media = window.matchMedia(mediaQuery);
    if (!savedTheme()) localStorage.setItem('theme', media.matches ? 'night' : 'default');
    const onChange = (event: MediaQueryListEvent) => {
      const theme = event.matches ? 'night' : 'default';
      localStorage.setItem('theme', theme);
      setSettings(previous => ({ ...previous, theme }));
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  function persist<K extends 'theme' | 'titleFontSize' | 'listSpacing'>(key: K, value: Settings[K]) {
    localStorage.setItem(key, value);
    setSettings(previous => ({ ...previous, [key]: value }));
  }
  return <SettingsContext.Provider value={{
    settings,
    toggleSettings: () => setSettings(previous => ({ ...previous, showSettings: !previous.showSettings })),
    toggleOpenLinksInNewTab: () => setSettings(previous => {
      const openLinkInNewTab = !previous.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
      return { ...previous, openLinkInNewTab };
    }),
    setTheme: theme => persist('theme', theme),
    setFont: font => persist('titleFontSize', font),
    setSpacing: spacing => persist('listSpacing', spacing),
  }}>{children}</SettingsContext.Provider>;
}
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
