// Port of src/app/shared/models/settings.ts.
export type Theme = 'default' | 'night' | 'amoledblack';

export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: Theme;
  titleFontSize: string;
  listSpacing: string;
}

/** Contract of SettingsService, exposed through useSettings(). */
export interface SettingsApi {
  settings: Settings;
  toggleSettings(): void;
  toggleOpenLinksInNewTab(): void;
  setTheme(theme: Theme): void;
  setFont(fontSize: string): void;
  setSpacing(listSpacing: string): void;
}

export const DEFAULT_SETTINGS: Settings = {
  showSettings: false,
  openLinkInNewTab: false,
  theme: 'default',
  titleFontSize: '16',
  listSpacing: '0',
};
