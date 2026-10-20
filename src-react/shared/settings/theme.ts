import { THEMES, type Settings } from '../models';

export const DEFAULT_SETTINGS: Readonly<Omit<Settings, 'theme'>> = {
    showSettings: false,
    openLinkInNewTab: false,
    titleFontSize: '16',
    listSpacing: '0',
};

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function darkSchemeMedia(): MediaQueryList | null {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia(DARK_SCHEME_QUERY)
        : null;
}

export function systemTheme(): string {
    return darkSchemeMedia()?.matches ? 'night' : 'default';
}

/** Puts `theme` on <html> and removes every other known theme class. */
export function applyThemeClass(theme: string, root: HTMLElement = document.documentElement): void {
    for (const name of THEMES) {
        if (name !== theme) root.classList.remove(name);
    }
    if (theme) root.classList.add(theme);
}
