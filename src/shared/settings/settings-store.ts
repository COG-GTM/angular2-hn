import type { Settings } from '../models/settings';

export const STORAGE_KEYS = {
    theme: 'theme',
    openLinkInNewTab: 'openLinkInNewTab',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
} as const;

export interface SettingsStore {
    getSettings(): Settings;
    subscribe(listener: () => void): () => void;
    toggleSettings(): void;
    toggleOpenLinksInNewTab(): void;
    setTheme(theme: string): void;
    setFont(fontSize: string): void;
    setSpacing(listSpacing: string): void;
    destroy(): void;
}

function readStoredBoolean(key: string): boolean {
    const stored = localStorage.getItem(key);
    if (!stored) {
        return false;
    }
    try {
        return Boolean(JSON.parse(stored));
    } catch {
        return false;
    }
}

function initialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: readStoredBoolean(STORAGE_KEYS.openLinkInNewTab),
        theme: 'default',
        titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) ?? '16',
        listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) ?? '0',
    };
}

export function createSettingsStore(): SettingsStore {
    let settings = initialSettings();
    const listeners = new Set<() => void>();
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const emit = () => listeners.forEach((listener) => listener());

    const update = (changes: Partial<Settings>) => {
        settings = { ...settings, ...changes };
        emit();
    };

    const setTheme = (theme: string) => {
        update({ theme });
        localStorage.setItem(STORAGE_KEYS.theme, theme);
    };

    const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
        setTheme(event.matches ? 'night' : 'default');
    };

    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (savedTheme) {
        settings = { ...settings, theme: savedTheme };
    } else {
        setTheme(darkColorSchemeMedia.matches ? 'night' : 'default');
    }

    return {
        getSettings: () => settings,
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        toggleSettings() {
            update({ showSettings: !settings.showSettings });
        },
        toggleOpenLinksInNewTab() {
            const openLinkInNewTab = !settings.openLinkInNewTab;
            update({ openLinkInNewTab });
            localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
        },
        setTheme,
        setFont(fontSize) {
            update({ titleFontSize: fontSize });
            localStorage.setItem(STORAGE_KEYS.titleFontSize, fontSize);
        },
        setSpacing(listSpacing) {
            update({ listSpacing });
            localStorage.setItem(STORAGE_KEYS.listSpacing, listSpacing);
        },
        destroy() {
            darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
            listeners.clear();
        },
    };
}
