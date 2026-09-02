import { createContext } from 'react';

import type { Settings } from '../models';

export const THEMES = ['default', 'night', 'amoledblack'] as const;

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function darkColorSchemeMedia(): MediaQueryList {
    return window.matchMedia(DARK_SCHEME_QUERY);
}

export function themeForColorScheme(prefersDark: boolean): string {
    return prefersDark ? 'night' : 'default';
}

export function loadInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const savedTheme = localStorage.getItem('theme');
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? (JSON.parse(openLinkInNewTab) as boolean) : false,
        theme: savedTheme ? savedTheme : themeForColorScheme(darkColorSchemeMedia().matches),
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}
