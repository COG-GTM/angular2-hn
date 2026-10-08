import type { Settings } from '../models';

// Port of the Angular SettingsService: same defaults and the same localStorage keys,
// so preferences saved by the Angular app carry over.
export const STORAGE_KEYS = {
    openLinkInNewTab: 'openLinkInNewTab',
    theme: 'theme',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
} as const;

export const THEMES = ['default', 'night', 'amoledblack'] as const;
export type Theme = (typeof THEMES)[number];

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function read(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function write(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Storage can be unavailable (private mode, quota); settings still apply for the session.
    }
}

export function systemTheme(): Theme {
    const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches;
    return prefersDark ? 'night' : 'default';
}

export function hasSavedTheme(): boolean {
    return read(STORAGE_KEYS.theme) !== null;
}

export function loadSettings(): Settings {
    const openLinkInNewTab = read(STORAGE_KEYS.openLinkInNewTab);
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab === 'true',
        theme: read(STORAGE_KEYS.theme) ?? systemTheme(),
        titleFontSize: read(STORAGE_KEYS.titleFontSize) ?? '16',
        listSpacing: read(STORAGE_KEYS.listSpacing) ?? '0',
    };
}

export function saveOpenLinkInNewTab(value: boolean): void {
    write(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(value));
}

export function saveTheme(theme: string): void {
    write(STORAGE_KEYS.theme, theme);
}

export function saveTitleFontSize(fontSize: string): void {
    write(STORAGE_KEYS.titleFontSize, fontSize);
}

export function saveListSpacing(listSpacing: string): void {
    write(STORAGE_KEYS.listSpacing, listSpacing);
}
