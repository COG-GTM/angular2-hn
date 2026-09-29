export const THEMES = ['default', 'night', 'amoledblack'] as const;

export type Theme = (typeof THEMES)[number];

export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: Theme;
  titleFontSize: string;
  listSpacing: string;
}
