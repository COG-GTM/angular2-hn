import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings, Theme } from '../models/types';
import { SettingsContext } from './settingsContextDef';

function getInitialSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const titleFontSize = localStorage.getItem('titleFontSize');
  const listSpacing = localStorage.getItem('listSpacing');

  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) as boolean : false,
    theme: 'default',
    titleFontSize: titleFontSize ?? '16',
    listSpacing: listSpacing ?? '0',
  };
}

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme');
  if (saved === 'default' || saved === 'night' || saved === 'amoledblack') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'default';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const initial = getInitialSettings();
    initial.theme = getInitialTheme();
    return initial;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setSettings(prev => ({ ...prev, theme: e.matches ? 'night' : 'default' }));
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleSettings = useCallback(() => {
    setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings(prev => {
      const next = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(next));
      return { ...prev, openLinkInNewTab: next };
    });
  }, []);

  const setThemeValue = useCallback((theme: Theme) => {
    localStorage.setItem('theme', theme);
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setFont = useCallback((fontSize: string) => {
    localStorage.setItem('titleFontSize', fontSize);
    setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
  }, []);

  const setSpacing = useCallback((listSpacing: string) => {
    localStorage.setItem('listSpacing', listSpacing);
    setSettings(prev => ({ ...prev, listSpacing }));
  }, []);

  return (
    <SettingsContext value={{
      settings,
      toggleSettings,
      toggleOpenLinksInNewTab,
      setTheme: setThemeValue,
      setFont,
      setSpacing,
    }}>
      {children}
    </SettingsContext>
  );
}
