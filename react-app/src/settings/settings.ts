export type Theme = 'default' | 'night' | 'amoledblack';

export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: Theme;
  titleFontSize: string;
  listSpacing: string;
}

export interface SettingsActions {
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Theme) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

export type SettingsContextValue = Settings & SettingsActions;

export const STORAGE_KEYS = {
  theme: 'theme',
  openLinkInNewTab: 'openLinkInNewTab',
  titleFontSize: 'titleFontSize',
  listSpacing: 'listSpacing',
} as const;

export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';
