import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

import { THEMES } from '../models';

type ChangeListener = (event: MediaQueryListEvent) => void;

/**
 * Stubs `window.matchMedia`. Returns `setMatches(next)` which fires a `change` event on every
 * registered listener, to simulate the OS switching color scheme.
 */
export function mockMatchMedia(matches = false): { setMatches: (next: boolean) => void } {
    const listeners = new Set<ChangeListener>();
    let current = matches;
    vi.stubGlobal(
        'matchMedia',
        vi.fn((query: string) => ({
            get matches() {
                return current;
            },
            media: query,
            onchange: null,
            addEventListener: (_type: string, cb: ChangeListener) => listeners.add(cb),
            removeEventListener: (_type: string, cb: ChangeListener) => listeners.delete(cb),
            addListener: (cb: ChangeListener) => listeners.add(cb),
            removeListener: (cb: ChangeListener) => listeners.delete(cb),
            dispatchEvent: () => false,
        }))
    );
    return {
        setMatches(next: boolean) {
            current = next;
            listeners.forEach((cb) =>
                cb({ matches: next, media: '(prefers-color-scheme: dark)' } as MediaQueryListEvent)
            );
        },
    };
}

beforeEach(() => {
    mockMatchMedia(false);
    vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.localStorage.clear();
    document.documentElement.classList.remove(...THEMES);
});
