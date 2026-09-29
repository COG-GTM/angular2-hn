import { THEMES, type Settings, type Theme } from '../models/settings';

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function isTheme(value: string | null): value is Theme {
  return THEMES.some((theme) => theme === value);
}

export function systemTheme(prefersDark: boolean): Theme {
  return prefersDark ? 'night' : 'default';
}

export function prefersDarkColorScheme(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches;
}

export function loadSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const savedTheme = localStorage.getItem('theme');
  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) === true : false,
    theme: isTheme(savedTheme) ? savedTheme : systemTheme(prefersDarkColorScheme()),
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0',
  };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem('openLinkInNewTab', JSON.stringify(settings.openLinkInNewTab));
  localStorage.setItem('theme', settings.theme);
  localStorage.setItem('titleFontSize', settings.titleFontSize);
  localStorage.setItem('listSpacing', settings.listSpacing);
}
