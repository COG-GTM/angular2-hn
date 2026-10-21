export const THEMES = ['default', 'night', 'amoledblack'] as const;

export type Theme = (typeof THEMES)[number];

export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: Theme;
  /** Kept as strings to match the Angular app's localStorage values. */
  titleFontSize: string;
  listSpacing: string;
}
