import type { Theme } from '../services/settings';

export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: Theme;
    titleFontSize: string;
    listSpacing: string;
}
