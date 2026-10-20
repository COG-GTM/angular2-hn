export type Theme = 'default' | 'night' | 'amoledblack';

export const THEMES: readonly Theme[] = ['default', 'night', 'amoledblack'];

export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: Theme;
    titleFontSize: string;
    listSpacing: string;
}
