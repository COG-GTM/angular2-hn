import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Settings } from '../models/settings';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextType>(null!);

export function useSettings() { return useContext(SettingsContext); }

function getInitialTheme(): string {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'default';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    showSettings: false,
    openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') || 'false'),
    theme: getInitialTheme(),
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0',
  });

  // Listen for system color scheme changes — only auto-switch when user hasn't explicitly chosen a theme
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        updateSettings({ theme: e.matches ? 'night' : 'default' });
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function updateSettings(partial: Partial<Settings>) {
    setSettings((prev: Settings) => ({ ...prev, ...partial }));
  }

  function toggleSettings() { setSettings((prev: Settings) => ({ ...prev, showSettings: !prev.showSettings })); }
  function toggleOpenLinksInNewTab() {
    setSettings((prev: Settings) => {
      const newVal = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
      return { ...prev, openLinkInNewTab: newVal };
    });
  }
  function setTheme(theme: string) {
    localStorage.setItem('theme', theme);
    updateSettings({ theme });
  }
  function setFont(fontSize: string) {
    localStorage.setItem('titleFontSize', fontSize);
    updateSettings({ titleFontSize: fontSize });
  }
  function setSpacing(listSpace: string) {
    localStorage.setItem('listSpacing', listSpace);
    updateSettings({ listSpacing: listSpace });
  }

  return (
    <SettingsContext.Provider value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}>
      {children}
    </SettingsContext.Provider>
  );
}
