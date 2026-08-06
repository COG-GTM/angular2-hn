import { vi } from 'vitest';

const DARK_QUERY = '(prefers-color-scheme: dark)';

export interface MatchMediaStub {
    setMatches: (matches: boolean) => void;
    listenerCount: () => number;
}

/**
 * Installs a controllable `window.matchMedia` stub, since jsdom never emits change events.
 */
export function stubMatchMedia(initialMatches = false): MatchMediaStub {
    let matches = initialMatches;
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const media = DARK_QUERY;

    const mediaQueryList = {
        get matches() {
            return matches;
        },
        media,
        onchange: null,
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
            listeners.add(listener);
        },
        removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
            listeners.delete(listener);
        },
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => true,
    };

    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => mediaQueryList)
    );

    return {
        setMatches: (next: boolean) => {
            matches = next;
            listeners.forEach((listener) => listener({ matches: next, media } as MediaQueryListEvent));
        },
        listenerCount: () => listeners.size,
    };
}
