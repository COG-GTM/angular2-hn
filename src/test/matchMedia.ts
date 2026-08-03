import { vi } from 'vitest';

export interface MatchMediaHandle {
    /** Simulates the OS colour scheme flipping, notifying every registered listener. */
    emitChange: (matches: boolean) => void;
    listenerCount: () => number;
}

/**
 * jsdom has no `window.matchMedia`, so tests install this controllable stand-in.
 */
export function installMatchMedia(matches: boolean): MatchMediaHandle {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    let currentMatches = matches;

    vi.stubGlobal('matchMedia', (media: string) => ({
        media,
        get matches() {
            return currentMatches;
        },
        onchange: null,
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
        removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
            listeners.delete(listener),
        addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
        removeListener: (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
        dispatchEvent: () => true,
    }));

    return {
        emitChange: (next: boolean) => {
            currentMatches = next;
            listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
        },
        listenerCount: () => listeners.size,
    };
}
