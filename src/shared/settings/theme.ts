import { THEMES, type Settings } from '../models';

export const DEFAULT_SETTINGS: Readonly<Settings> = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
};

export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function darkSchemeMedia(): MediaQueryList | null {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia(DARK_SCHEME_QUERY)
        : null;
}

/** Angular `handleSystemPreferredColorSchemeChange`: dark → `night`, otherwise `default`. */
export function systemTheme(): string {
    return darkSchemeMedia()?.matches ? 'night' : 'default';
}

/**
 * Puts the theme class on `<html>` and removes the other known theme classes. Angular wrapped the app
 * in `<div class="{{ settings.theme }}">`; `_themes.scss` only needs the class on *an ancestor* of
 * `.body-cover` / `.wrapper`, so `<html>` works and keeps portals/overlays themed too.
 */
export function applyThemeClass(theme: string, root: HTMLElement = document.documentElement): void {
    for (const name of THEMES) {
        if (name !== theme) root.classList.remove(name);
    }
    if (theme) root.classList.add(theme);
}
