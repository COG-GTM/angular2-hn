/**
 * `localStorage` and `matchMedia` are unavailable in some environments (private
 * browsing quota errors, SSR, older browsers), so every access is guarded.
 */
export function readStoredValue(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function writeStoredValue(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Persisting settings is best effort.
    }
}

export function getDarkColorSchemeMedia(): MediaQueryList | null {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
}
