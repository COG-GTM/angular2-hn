import { createContext } from 'react';

import type { Settings, Theme } from '../models';

export interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Theme) => void;
  setFont: (titleFontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

/** localStorage keys, shared with the Angular app. */
export const STORAGE_KEYS = {
  theme: 'theme',
  titleFontSize: 'titleFontSize',
  listSpacing: 'listSpacing',
  openLinkInNewTab: 'openLinkInNewTab',
} as const;
