import type { Settings } from '../models';

/** Exact Angular theme class names. */
export type Theme = 'default' | 'night' | 'amoledblack';

export const THEMES: readonly { value: Theme; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
];

export const STORAGE_KEYS = {
    openLinkInNewTab: 'openLinkInNewTab',
    theme: 'theme',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
} as const;

export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function isTheme(value: string | null): value is Theme {
    return THEMES.some((theme) => theme.value === value);
}

export function getSystemTheme(): Theme {
    const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia(DARK_SCHEME_QUERY).matches;
    return prefersDark ? 'night' : 'default';
}

/** The persisted theme, or null when none (or an unknown value) is saved. */
export function getSavedTheme(): Theme | null {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    return isTheme(saved) ? saved : null;
}

function loadOpenLinkInNewTab(): boolean {
    const saved = localStorage.getItem(STORAGE_KEYS.openLinkInNewTab);
    if (!saved) {
        return false;
    }
    try {
        return JSON.parse(saved) === true;
    } catch {
        return false;
    }
}

export function loadSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: loadOpenLinkInNewTab(),
        theme: getSavedTheme() ?? getSystemTheme(),
        titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) || '16',
        listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) || '0',
    };
}

export function saveTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
}

export function saveOpenLinkInNewTab(value: boolean): void {
    localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(value));
}

export function saveTitleFontSize(value: string): void {
    localStorage.setItem(STORAGE_KEYS.titleFontSize, value);
}

export function saveListSpacing(value: string): void {
    localStorage.setItem(STORAGE_KEYS.listSpacing, value);
}
