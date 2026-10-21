/** localStorage keys — identical to Angular's SettingsService. */
export const STORAGE_KEYS = {
    theme: 'theme',
    openLinkInNewTab: 'openLinkInNewTab',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
} as const;

export function readStorage(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function writeStorage(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Storage can be unavailable (private mode, quota); settings still work for the session.
    }
}

/** Angular parity: a missing/empty value falls back to the default (`getItem(k) ? getItem(k) : default`). */
export function readString(key: string, fallback: string): string {
    return readStorage(key) || fallback;
}

/** Only a stored JSON `true` counts as true (`JSON.parse(raw) === true`). */
export function readBoolean(key: string, fallback: boolean): boolean {
    const raw = readStorage(key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) === true;
    } catch {
        return fallback;
    }
}
