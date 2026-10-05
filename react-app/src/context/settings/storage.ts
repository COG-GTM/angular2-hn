import { THEMES, type Settings, type Theme } from '../../models';

export const STORAGE_KEYS = {
  theme: 'theme',
  openLinkInNewTab: 'openLinkInNewTab',
  titleFontSize: 'titleFontSize',
  listSpacing: 'listSpacing',
} as const;

export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function isTheme(value: string | null): value is Theme {
  return !!value && (THEMES as readonly string[]).includes(value);
}

function readBoolean(key: string): boolean {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'false') === true;
  } catch {
    return false;
  }
}

export function themeForColorScheme(prefersDark: boolean): Theme {
  return prefersDark ? 'night' : 'default';
}

/** Mirrors the Angular SettingsService initial state: saved values, else system colour scheme for the theme. */
export function loadInitialSettings(): Settings {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  return {
    showSettings: false,
    openLinkInNewTab: readBoolean(STORAGE_KEYS.openLinkInNewTab),
    theme: isTheme(savedTheme) ? savedTheme : themeForColorScheme(window.matchMedia(DARK_SCHEME_QUERY).matches),
    titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) || '16',
    listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) || '0',
  };
}
