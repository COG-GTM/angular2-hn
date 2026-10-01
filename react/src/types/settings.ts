/** Mirrors src/app/shared/models/settings.ts and the theme list in the settings component. */
export type Theme = 'default' | 'night' | 'amoledblack';

export const THEMES: readonly { value: Theme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'night', label: 'Night' },
  { value: 'amoledblack', label: 'AMOLED Black' },
];

export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: Theme;
  titleFontSize: string;
  listSpacing: string;
}

/** Same method names as Angular's SettingsService. */
export interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Theme) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpacing: string) => void;
}

export const DEFAULT_SETTINGS: Settings = {
  showSettings: false,
  openLinkInNewTab: false,
  theme: 'default',
  titleFontSize: '16',
  listSpacing: '0',
};
