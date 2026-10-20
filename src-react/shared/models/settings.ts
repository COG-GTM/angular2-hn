export type ThemeName = 'default' | 'night' | 'amoledblack';

export const THEMES: readonly ThemeName[] = ['default', 'night', 'amoledblack'];

export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    /** One of `THEMES`; typed as string because it round-trips through localStorage like Angular. */
    theme: string;
    titleFontSize: string;
    listSpacing: string;
}
