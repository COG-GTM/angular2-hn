import type { Settings } from '../models/settings';

export const STORAGE_KEYS = {
    openLinkInNewTab: 'openLinkInNewTab',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
    theme: 'theme',
} as const;

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export type SettingsAction =
    | { type: 'toggleSettings' }
    | { type: 'toggleOpenLinksInNewTab' }
    | { type: 'setTheme'; theme: string }
    | { type: 'setFont'; fontSize: string }
    | { type: 'setSpacing'; listSpace: string };

export function getDarkColorSchemeMedia(): MediaQueryList | null {
    return typeof window.matchMedia === 'function' ? window.matchMedia(DARK_COLOR_SCHEME_QUERY) : null;
}

export function systemTheme(prefersDark: boolean): string {
    return prefersDark ? 'night' : 'default';
}

export function loadSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem(STORAGE_KEYS.openLinkInNewTab);
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: localStorage.getItem(STORAGE_KEYS.theme) || systemTheme(getDarkColorSchemeMedia()?.matches ?? false),
        titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) || '16',
        listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) || '0',
    };
}

export function settingsReducer(state: Settings, action: SettingsAction): Settings {
    switch (action.type) {
        case 'toggleSettings':
            return { ...state, showSettings: !state.showSettings };
        case 'toggleOpenLinksInNewTab':
            return { ...state, openLinkInNewTab: !state.openLinkInNewTab };
        case 'setTheme':
            return { ...state, theme: action.theme };
        case 'setFont':
            return { ...state, titleFontSize: action.fontSize };
        case 'setSpacing':
            return { ...state, listSpacing: action.listSpace };
    }
}
