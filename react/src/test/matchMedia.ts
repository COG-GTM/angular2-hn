import { vi } from 'vitest';

type ChangeListener = (event: MediaQueryListEvent) => void;

export interface MatchMediaMock {
    /** The spy installed as `window.matchMedia`. */
    matchMedia: ReturnType<typeof vi.fn>;
    /** Updates `matches` and notifies `change` listeners, like the OS switching colour scheme. */
    setMatches(matches: boolean): void;
    /** Number of currently registered `change` listeners. */
    listenerCount(): number;
    /** Removes the mock, restoring jsdom's original (absent) `matchMedia`. */
    restore(): void;
}

/** Installs a controllable `window.matchMedia` (jsdom has none). Every query shares the same `matches` state. */
export function mockMatchMedia(initialMatches = false): MatchMediaMock {
    const original = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    const listeners = new Set<ChangeListener>();
    let matches = initialMatches;

    const matchMedia = vi.fn((media: string) => {
        const mql = {
            get matches() {
                return matches;
            },
            media,
            onchange: null,
            addEventListener: (type: string, listener: ChangeListener) => {
                if (type === 'change') listeners.add(listener);
            },
            removeEventListener: (type: string, listener: ChangeListener) => {
                if (type === 'change') listeners.delete(listener);
            },
            addListener: (listener: ChangeListener) => listeners.add(listener),
            removeListener: (listener: ChangeListener) => listeners.delete(listener),
            dispatchEvent: () => true,
        };
        return mql as unknown as MediaQueryList;
    });

    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: matchMedia });

    return {
        matchMedia,
        setMatches(next: boolean) {
            matches = next;
            const event = { matches: next, media: '' } as MediaQueryListEvent;
            [...listeners].forEach((listener) => listener(event));
        },
        listenerCount: () => listeners.size,
        restore() {
            if (original) {
                Object.defineProperty(window, 'matchMedia', original);
            } else {
                delete (window as { matchMedia?: unknown }).matchMedia;
            }
        },
    };
}
