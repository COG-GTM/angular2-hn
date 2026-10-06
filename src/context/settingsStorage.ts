import { isFeedName } from '../models';
import { THEMES, type AppSettings, type Theme } from './settingsContext';

export const STORAGE_KEYS = {
    openLinkInNewTab: 'openLinkInNewTab',
    theme: 'theme',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
    defaultFeed: 'defaultFeed',
} as const;

export function isTheme(value: unknown): value is Theme {
    return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

function parseBoolean(value: string | null): boolean {
    if (!value) {
        return false;
    }
    try {
        return JSON.parse(value) === true;
    } catch {
        return false;
    }
}

export function systemTheme(prefersDark: boolean): Theme {
    return prefersDark ? 'night' : 'default';
}

export function loadSettings(storage: Storage, prefersDark: boolean): AppSettings {
    const savedTheme = storage.getItem(STORAGE_KEYS.theme);
    const savedFeed = storage.getItem(STORAGE_KEYS.defaultFeed);
    return {
        showSettings: false,
        openLinkInNewTab: parseBoolean(storage.getItem(STORAGE_KEYS.openLinkInNewTab)),
        theme: isTheme(savedTheme) ? savedTheme : systemTheme(prefersDark),
        titleFontSize: storage.getItem(STORAGE_KEYS.titleFontSize) || '16',
        listSpacing: storage.getItem(STORAGE_KEYS.listSpacing) || '0',
        defaultFeed: isFeedName(savedFeed) ? savedFeed : 'news',
    };
}
