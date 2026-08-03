import { createContext } from 'react';

import type { Settings } from '../models';

export interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (titleFontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** Restores the persisted settings, falling back to the system color scheme for the theme. */
export function readStoredSettings(): Settings {
  const storedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const storedTheme = localStorage.getItem('theme');

  return {
    showSettings: false,
    openLinkInNewTab: storedOpenLinkInNewTab ? JSON.parse(storedOpenLinkInNewTab) : false,
    theme: storedTheme ?? (window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches ? 'night' : 'default'),
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}
