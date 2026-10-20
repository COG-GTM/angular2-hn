import { useCallback, useState } from 'react';

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

/** Only a stored JSON `true` counts as true. */
export function readBoolean(key: string, fallback: boolean): boolean {
    const raw = readStorage(key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) === true;
    } catch {
        return fallback;
    }
}

export interface StorageCodec<T> {
    read: (key: string, fallback: T) => T;
    write: (value: T) => string;
}

export const stringCodec: StorageCodec<string> = { read: readString, write: (value) => value };
export const booleanCodec: StorageCodec<boolean> = { read: readBoolean, write: (value) => JSON.stringify(value) };

/** `useState` that is initialised from localStorage and writes every update back to it. */
export function useLocalStorage<T>(
    key: string,
    fallback: T | (() => T),
    codec: StorageCodec<T>
): [T, (value: T) => void] {
    const [value, setValue] = useState<T>(() =>
        codec.read(key, typeof fallback === 'function' ? (fallback as () => T)() : fallback)
    );
    const setAndStore = useCallback(
        (next: T) => {
            setValue(next);
            writeStorage(key, codec.write(next));
        },
        [key, codec]
    );
    return [value, setAndStore];
}
