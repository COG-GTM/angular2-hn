import { useCallback, useState } from 'react';

export interface Codec<T> {
    parse: (raw: string) => T;
    stringify: (value: T) => string;
}

export const stringCodec: Codec<string> = { parse: (raw) => raw, stringify: (value) => value };
export const jsonCodec = <T>(): Codec<T> => ({ parse: (raw) => JSON.parse(raw) as T, stringify: JSON.stringify });

function read<T>(key: string, codec: Codec<T>): T | null {
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? codec.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * State persisted in localStorage under `key`. `initial` is used when nothing (or an empty value)
 * is stored, matching the `localStorage.getItem(k) ? ... : default` logic of the Angular SettingsService.
 */
export function useLocalStorage<T>(key: string, initial: T | (() => T), codec: Codec<T>) {
    const [value, setValue] = useState<T>(() => {
        const stored = read(key, codec);
        if (stored !== null) {
            return stored;
        }
        return typeof initial === 'function' ? (initial as () => T)() : initial;
    });

    const setAndPersist = useCallback(
        (next: T) => {
            setValue(next);
            try {
                window.localStorage.setItem(key, codec.stringify(next));
            } catch {
                // Storage can be unavailable (private mode, quota); keep the in-memory value.
            }
        },
        [key, codec]
    );

    return [value, setAndPersist] as const;
}
